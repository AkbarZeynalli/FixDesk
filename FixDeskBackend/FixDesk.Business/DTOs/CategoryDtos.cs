using FixDesk.Entities.Enums;

namespace FixDesk.Business.DTOs;

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TicketCategoryType Type { get; set; }
    public string TypeName => Type.ToString();
}

public class CreateCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TicketCategoryType Type { get; set; } = TicketCategoryType.General;
}
