using FixDesk.Entities.Common;
using FixDesk.Entities.Enums;

namespace FixDesk.Entities;

public class Category : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TicketCategoryType Type { get; set; } = TicketCategoryType.General;

    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    public ICollection<KnowledgeBaseArticle> Articles { get; set; } = new List<KnowledgeBaseArticle>();
}
