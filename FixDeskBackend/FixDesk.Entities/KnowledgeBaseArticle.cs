using FixDesk.Entities.Common;

namespace FixDesk.Entities;

public class KnowledgeBaseArticle : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public int AuthorId { get; set; }
    public User Author { get; set; } = null!;

    public int ViewCount { get; set; } = 0;
}
