using FixDesk.Entities.Common;

namespace FixDesk.Entities;

public class InventoryItem : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string ModelOrSku { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Unit { get; set; } = "Pcs";

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}
