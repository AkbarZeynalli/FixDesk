using FixDesk.Api.Hubs;
using FixDesk.Business.DTOs;
using FixDesk.Business.Services.Abstract;
using FixDesk.Entities.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace FixDesk.Api.Controllers;

[Authorize]
public class TicketsController : BaseApiController
{
    private readonly ITicketService _ticketService;
    private readonly ITelegramBotService _telegramBotService;
    private readonly IHubContext<TicketHub> _hubContext;

    public TicketsController(
        ITicketService ticketService,
        ITelegramBotService telegramBotService,
        IHubContext<TicketHub> hubContext)
    {
        _ticketService = ticketService;
        _telegramBotService = telegramBotService;
        _hubContext = hubContext;
    }

    [HttpGet("test-telegram")]
    [AllowAnonymous]
    public async Task<IActionResult> TestTelegram()
    {
        try
        {
            await _telegramBotService.SendNotificationAsync("🔔 <b>FixDesk Test Bildirişi</b>\n\nTelegram inteqrasiyası uğurla işləyir!");
            return Ok(new { success = true, message = "Telegram bildirişi göndərilməyə çalışıldı. Zəhmət olmasa Telegram-ı yoxlayın." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, error = ex.Message, details = ex.ToString() });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] TicketStatus? status,
        [FromQuery] TicketPriority? priority,
        [FromQuery] int? categoryId,
        [FromQuery] int? branchId,
        [FromQuery] int? assignedToUserId,
        [FromQuery] int? createdByUserId)
    {
        var result = await _ticketService.GetAllTicketsAsync(
            status, priority, categoryId, branchId, assignedToUserId, createdByUserId,
            CurrentUserId, CurrentUserRole, CurrentBranchId);

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _ticketService.GetByIdAsync(id, CurrentUserId, CurrentUserRole, CurrentBranchId);
        if (!result.IsSuccess)
        {
            if (result.IsForbidden)
            {
                return StatusCode(StatusCodes.Status403Forbidden, result);
            }
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTicketDto dto)
    {
        var result = await _ticketService.CreateTicketAsync(dto, CurrentUserId);
        if (!result.IsSuccess) return BadRequest(result);

        await _hubContext.Clients.Group("ITSpecialists").SendAsync("ReceiveNewTicket", result.Data);

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin,ITSpecialist,FieldEngineer")]
    public async Task<IActionResult> ChangeStatus(int id, [FromBody] ChangeTicketStatusDto dto)
    {
        var result = await _ticketService.ChangeStatusAsync(id, dto, CurrentUserId);
        if (!result.IsSuccess) return BadRequest(result);

        await _hubContext.Clients.Group($"Ticket_{id}").SendAsync("ReceiveStatusUpdate", result.Data);

        return Ok(result);
    }

    [HttpPut("{id}/assign")]
    [Authorize(Roles = "Admin,ITSpecialist,FieldEngineer")]
    public async Task<IActionResult> AssignSpecialist(int id, [FromBody] AssignTicketDto dto)
    {
        var result = await _ticketService.AssignSpecialistAsync(id, dto.SpecialistUserId, CurrentUserId);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpPost("{id}/comments")]
    public async Task<IActionResult> AddComment(int id, [FromBody] AddCommentDto dto)
    {
        var result = await _ticketService.AddCommentAsync(id, dto, CurrentUserId);
        if (!result.IsSuccess) return BadRequest(result);

        await _hubContext.Clients.Group($"Ticket_{id}").SendAsync("ReceiveComment", result.Data);

        return Ok(result);
    }
}