namespace FixDesk.Business.DTOs;

public class InventoryItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ModelOrSku { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
}

public class CreateInventoryItemDto
{
    public string Name { get; set; } = string.Empty;
    public string ModelOrSku { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Unit { get; set; } = "Pcs";
    public int CategoryId { get; set; }
}
