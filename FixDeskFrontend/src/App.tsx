import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SignalRProvider } from './context/SignalRContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Toaster } from 'react-hot-toast';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Tickets } from './pages/Tickets';
import { CreateTicket } from './pages/CreateTicket';
import { TicketDetails } from './pages/TicketDetails';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { Inventory } from './pages/Inventory';
import { Branches } from './pages/Branches';
import { Categories } from './pages/Categories';
import { UsersPage } from './pages/Users';
import { UserRole } from './types';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SignalRProvider>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <BrowserRouter>
            <Routes>
              {/* Public Login Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected Main Application Layout */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tickets" element={<Tickets />} />
                  <Route path="/tickets/new" element={<CreateTicket />} />
                  <Route path="/tickets/:id" element={<TicketDetails />} />
                  <Route path="/knowledge-base" element={<KnowledgeBase />} />

                  {/* RBAC Restricted Routes */}
                  <Route
                    element={
                      <ProtectedRoute
                        allowedRoles={[
                          UserRole.Admin,
                          UserRole.ITSpecialist,
                          UserRole.FieldEngineer,
                          UserRole.InventoryManager,
                        ]}
                      />
                    }
                  >
                    <Route path="/inventory" element={<Inventory />} />
                  </Route>

                  <Route
                    element={
                      <ProtectedRoute
                        allowedRoles={[UserRole.Admin, UserRole.BranchManager]}
                      />
                    }
                  >
                    <Route path="/branches" element={<Branches />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={[UserRole.Admin]} />}>
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/users" element={<UsersPage />} />
                  </Route>
                </Route>
              </Route>

              {/* Fallback Redirect */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </SignalRProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
