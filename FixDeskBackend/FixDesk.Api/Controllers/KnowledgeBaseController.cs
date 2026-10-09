using FixDesk.Business.DTOs;
using FixDesk.Business.Services.Abstract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FixDesk.Api.Controllers;

[Authorize]
public class KnowledgeBaseController : BaseApiController
{
    private readonly IKnowledgeBaseService _knowledgeBaseService;

    public KnowledgeBaseController(IKnowledgeBaseService knowledgeBaseService)
    {
        _knowledgeBaseService = knowledgeBaseService;
    }

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string? query, [FromQuery] int? categoryId)
    {
        var result = await _knowledgeBaseService.SearchArticlesAsync(query, categoryId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _knowledgeBaseService.GetByIdAsync(id);
        if (!result.IsSuccess) return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,ITSpecialist,FieldEngineer")]
    public async Task<IActionResult> Create([FromBody] CreateArticleDto dto)
    {
        var result = await _knowledgeBaseService.CreateAsync(dto, CurrentUserId);
        if (!result.IsSuccess) return BadRequest(result);
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }
}
