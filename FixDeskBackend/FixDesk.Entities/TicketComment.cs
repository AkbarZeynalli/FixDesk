using FixDesk.Entities.Common;

namespace FixDesk.Entities;

public class TicketComment : BaseEntity
{
    public int TicketId { get; set; }
    public Ticket Ticket { get; set; } = null!;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public string CommentText { get; set; } = string.Empty;
}
