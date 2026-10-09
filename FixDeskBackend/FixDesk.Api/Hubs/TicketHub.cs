using Microsoft.AspNetCore.SignalR;

namespace FixDesk.Api.Hubs;

public class TicketHub : Hub
{
    public async Task JoinTicketGroup(int ticketId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Ticket_{ticketId}");
    }

    public async Task LeaveTicketGroup(int ticketId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Ticket_{ticketId}");
    }

    public async Task JoinITSpecialistGroup()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "ITSpecialists");
    }
}

