using FixDesk.Business.Common;
using FixDesk.Business.DTOs;
using FixDesk.Business.Services.Abstract;
using FixDesk.DataAccess.Abstract;
using FixDesk.Entities;
using Microsoft.EntityFrameworkCore;

namespace FixDesk.Business.Services.Concrete;

public class InventoryService : IInventoryService
{
    private readonly IGenericRepository<InventoryItem> _inventoryRepo;
    private readonly IGenericRepository<Category> _categoryRepo;

    public InventoryService(
        IGenericRepository<InventoryItem> inventoryRepo,
        IGenericRepository<Category> categoryRepo)
    {
        _inventoryRepo = inventoryRepo;
        _categoryRepo = categoryRepo;
    }

    public async Task<ServiceResult<IEnumerable<InventoryItemDto>>> GetAllAsync(int? categoryId = null)
    {
        var query = _inventoryRepo.Query().Include(i => i.Category).AsQueryable();
        if (categoryId.HasValue)
        {
            query = query.Where(i => i.CategoryId == categoryId.Value);
        }

        var items = await query.ToListAsync();
        var dtos = items.Select(i => new InventoryItemDto
        {
            Id = i.Id,
            Name = i.Name,
            ModelOrSku = i.ModelOrSku,
            Quantity = i.Quantity,
            Unit = i.Unit,
            CategoryId = i.CategoryId,
            CategoryName = i.Category?.Name ?? ""
        });

        return ServiceResult<IEnumerable<InventoryItemDto>>.Success(dtos);
    }

    public async Task<ServiceResult<InventoryItemDto>> CreateAsync(CreateInventoryItemDto dto)
    {
        var category = await _categoryRepo.GetByIdAsync(dto.CategoryId);
        if (category == null) return ServiceResult<InventoryItemDto>.Failure("Seçilmiş kateqoriya tapılmadı.");

        var item = new InventoryItem
        {
            Name = dto.Name,
            ModelOrSku = dto.ModelOrSku,
            Quantity = dto.Quantity,
            Unit = dto.Unit,
            CategoryId = dto.CategoryId
        };

        await _inventoryRepo.AddAsync(item);
        await _inventoryRepo.SaveChangesAsync();

        var result = new InventoryItemDto
        {
            Id = item.Id,
            Name = item.Name,
            ModelOrSku = item.ModelOrSku,
            Quantity = item.Quantity,
            Unit = item.Unit,
            CategoryId = item.CategoryId,
            CategoryName = category.Name
        };

        return ServiceResult<InventoryItemDto>.Success(result, "Inventar əşyası əlavə edildi.");
    }

    public async Task<ServiceResult<InventoryItemDto>> UpdateQuantityAsync(int id, int newQuantity)
    {
        var item = await _inventoryRepo.Query(i => i.Id == id).Include(i => i.Category).FirstOrDefaultAsync();
        if (item == null) return ServiceResult<InventoryItemDto>.Failure("Inventar əşyası tapılmadı.");

        item.Quantity = newQuantity;
        _inventoryRepo.Update(item);
        await _inventoryRepo.SaveChangesAsync();

        var result = new InventoryItemDto
        {
            Id = item.Id,
            Name = item.Name,
            ModelOrSku = item.ModelOrSku,
            Quantity = item.Quantity,
            Unit = item.Unit,
            CategoryId = item.CategoryId,
            CategoryName = item.Category?.Name ?? ""
        };

        return ServiceResult<InventoryItemDto>.Success(result, "Inventar miqdarı yeniləndi.");
    }
}
