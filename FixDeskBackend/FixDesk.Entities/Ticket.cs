using FixDesk.Entities.Common;
using FixDesk.Entities.Enums;

namespace FixDesk.Entities;

public class Ticket : BaseEntity
{
    public string TicketNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    public TicketStatus Status { get; set; } = TicketStatus.New;
    public TicketPriority Priority { get; set; } = TicketPriority.Medium;

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public int BranchId { get; set; }
    public Branch Branch { get; set; } = null!;

    public int CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;

    public int? AssignedToUserId { get; set; }
    public User? AssignedToUser { get; set; }

    public string? ResolutionNotes { get; set; }
    public DateTime? SlaDueDate { get; set; }
    public bool IsSlaBreached { get; set; } = false;
    public DateTime? ClosedAt { get; set; }

    public ICollection<TicketAttachment> Attachments { get; set; } = new List<TicketAttachment>();
    public ICollection<TicketComment> Comments { get; set; } = new List<TicketComment>();
}
