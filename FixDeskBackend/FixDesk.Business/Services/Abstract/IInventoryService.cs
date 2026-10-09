using FixDesk.Business.Common;
using FixDesk.Business.DTOs;

namespace FixDesk.Business.Services.Abstract;

public interface IInventoryService
{
    Task<ServiceResult<IEnumerable<InventoryItemDto>>> GetAllAsync(int? categoryId = null);
    Task<ServiceResult<InventoryItemDto>> CreateAsync(CreateInventoryItemDto dto);
    Task<ServiceResult<InventoryItemDto>> UpdateQuantityAsync(int id, int newQuantity);
}
