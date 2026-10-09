import React, { createContext, useContext, useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from './AuthContext';
import { Ticket, TicketComment } from '../types';
import toast from 'react-hot-toast';

interface SignalRContextType {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
  joinTicketGroup: (ticketId: number) => Promise<void>;
  leaveTicketGroup: (ticketId: number) => Promise<void>;
  onReceiveComment: (callback: (comment: TicketComment) => void) => () => void;
  onReceiveStatusUpdate: (callback: (ticket: Ticket) => void) => () => void;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

// Web Audio API Synthesizer Chime Sound
export const playChimeSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5 note

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch (e) {
    console.warn('AudioContext chime notice omitted:', e);
  }
};

export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7190';
  const HUB_URL = `${API_BASE_URL}/hubs/ticketHub`;

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (connection) {
        connection.stop();
        setConnection(null);
        setIsConnected(false);
      }
      return;
    }

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => localStorage.getItem('fixdesk_token') || token,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    setConnection(newConnection);
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!connection) return;

    let isMounted = true;

    const startConnection = async () => {
      try {
        await connection.start();
        if (isMounted) {
          setIsConnected(true);
          console.log('⚡ SignalR Real-Time Hub Connected Successfully!');

          // Join İT Specialist Group if applicable
          try {
            await connection.invoke('JoinITSpecialistGroup');
          } catch (e) {
            // Group invoke optional depending on backend hub setup
          }
        }
      } catch (err) {
        console.warn('SignalR Hub Connection Attempt (Backend Hub may be offline):', err);
      }
    };

    startConnection();

    // Global listener for new tickets
    connection.on('ReceiveNewTicket', (ticket: Ticket) => {
      playChimeSound();
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <div>
              <p className="font-bold text-xs text-slate-900 dark:text-white">
                🎉 Yeni Ticket Açıldı: <span className="font-mono text-indigo-600">{ticket.ticketCode || 'TICK-2026'}</span>
              </p>
              <p className="text-xs text-slate-500 line-clamp-1">{ticket.title}</p>
            </div>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                window.location.href = `/tickets/${ticket.id}`;
              }}
              className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold shrink-0 hover:bg-indigo-500"
            >
              Bax
            </button>
          </div>
        ),
        { duration: 6000, icon: '🔔' }
      );
    });

    return () => {
      isMounted = false;
      connection.off('ReceiveNewTicket');
      if (connection.state === signalR.HubConnectionState.Connected) {
        connection.stop();
      }
    };
  }, [connection]);

  const joinTicketGroup = async (ticketId: number) => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      try {
        await connection.invoke('JoinTicketGroup', ticketId);
      } catch (e) {
        console.warn('SignalR JoinTicketGroup invoke error:', e);
      }
    }
  };

  const leaveTicketGroup = async (ticketId: number) => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      try {
        await connection.invoke('LeaveTicketGroup', ticketId);
      } catch (e) {
        console.warn('SignalR LeaveTicketGroup invoke error:', e);
      }
    }
  };

  const onReceiveComment = (callback: (comment: TicketComment) => void) => {
    if (connection) {
      connection.on('ReceiveComment', callback);
      return () => {
        connection.off('ReceiveComment', callback);
      };
    }
    return () => {};
  };

  const onReceiveStatusUpdate = (callback: (ticket: Ticket) => void) => {
    if (connection) {
      connection.on('ReceiveStatusUpdate', callback);
      return () => {
        connection.off('ReceiveStatusUpdate', callback);
      };
    }
    return () => {};
  };

  return (
    <SignalRContext.Provider
      value={{
        connection,
        isConnected,
        joinTicketGroup,
        leaveTicketGroup,
        onReceiveComment,
        onReceiveStatusUpdate,
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error('useSignalR must be used within a SignalRProvider');
  }
  return context;
};

