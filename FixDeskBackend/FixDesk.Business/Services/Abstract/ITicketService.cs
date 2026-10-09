using FixDesk.Business.Common;
using FixDesk.Business.DTOs;
using FixDesk.Entities.Enums;

namespace FixDesk.Business.Services.Abstract;

public interface ITicketService
{
    Task<ServiceResult<TicketDto>> CreateTicketAsync(CreateTicketDto dto, int currentUserId);
    Task<ServiceResult<TicketDto>> GetByIdAsync(int id, int currentUserId, UserRole currentRole, int? currentBranchId);
    Task<ServiceResult<IEnumerable<TicketDto>>> GetAllTicketsAsync(
        TicketStatus? status = null,
        TicketPriority? priority = null,
        int? categoryId = null,
        int? branchId = null,
        int? assignedToUserId = null,
        int? createdByUserId = null,
        int? currentUserId = null,
        UserRole? currentRole = null,
        int? userBranchId = null);
    Task<ServiceResult<TicketDto>> ChangeStatusAsync(int ticketId, ChangeTicketStatusDto dto, int currentUserId);
    Task<ServiceResult<TicketDto>> AssignSpecialistAsync(int ticketId, int specialistUserId, int currentUserId);
    Task<ServiceResult<TicketCommentDto>> AddCommentAsync(int ticketId, AddCommentDto dto, int currentUserId);
}
