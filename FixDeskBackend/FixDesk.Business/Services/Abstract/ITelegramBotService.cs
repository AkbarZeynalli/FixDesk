namespace FixDesk.Business.Services.Abstract;

public interface ITelegramBotService
{
    Task SendNotificationAsync(string message, string? chatId = null);
    Task SendNewTicketNotificationAsync(string ticketNumber, string title, string category, string priority, string branchName, string createdBy);
    Task SendTicketStatusUpdateNotificationAsync(string ticketNumber, string title, string newStatus, string? resolutionNotes);
    Task SendTicketAssignedNotificationAsync(string ticketNumber, string title, string specialistName);
}

