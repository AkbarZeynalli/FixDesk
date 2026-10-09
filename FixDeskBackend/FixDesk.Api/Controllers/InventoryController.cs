using FixDesk.Business.DTOs;
using FixDesk.Business.Services.Abstract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FixDesk.Api.Controllers;

[Authorize(Roles = "Admin,ITSpecialist,FieldEngineer,InventoryManager")]
public class InventoryController : BaseApiController
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? categoryId)
    {
        var result = await _inventoryService.GetAllAsync(categoryId);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,InventoryManager")]
    public async Task<IActionResult> Create([FromBody] CreateInventoryItemDto dto)
    {
        var result = await _inventoryService.CreateAsync(dto);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpPut("{id}/quantity")]
    [Authorize(Roles = "Admin,InventoryManager,ITSpecialist")]
    public async Task<IActionResult> UpdateQuantity(int id, [FromBody] int quantity)
    {
        var result = await _inventoryService.UpdateQuantityAsync(id, quantity);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }
}
