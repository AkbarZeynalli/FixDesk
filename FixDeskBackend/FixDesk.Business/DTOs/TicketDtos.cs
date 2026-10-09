using FixDesk.Entities.Enums;

namespace FixDesk.Business.DTOs;

public class CreateTicketDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TicketPriority Priority { get; set; } = TicketPriority.Medium;
    public int CategoryId { get; set; }
    public int BranchId { get; set; }
}

public class UpdateTicketDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TicketPriority Priority { get; set; }
    public int CategoryId { get; set; }
}

public class ChangeTicketStatusDto
{
    public TicketStatus Status { get; set; }
    public string? ResolutionNotes { get; set; }
}

public class AssignTicketDto
{
    public int SpecialistUserId { get; set; }
}

public class AddCommentDto
{
    public string CommentText { get; set; } = string.Empty;
}

public class TicketCommentDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public string CommentText { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class TicketAttachmentDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
}

public class TicketDto
{
    public int Id { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    public TicketStatus Status { get; set; }
    public string StatusName => Status.ToString();

    public TicketPriority Priority { get; set; }
    public string PriorityName => Priority.ToString();

    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;

    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;

    public int CreatedByUserId { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;

    public int? AssignedToUserId { get; set; }
    public string? AssignedToUserName { get; set; }

    public string? ResolutionNotes { get; set; }
    public DateTime? SlaDueDate { get; set; }
    public bool IsSlaBreached { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ClosedAt { get; set; }

    public List<TicketAttachmentDto> Attachments { get; set; } = new();
    public List<TicketCommentDto> Comments { get; set; } = new();
}
