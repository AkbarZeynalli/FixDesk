using FixDesk.Business.Common;
using FixDesk.Business.DTOs;
using FixDesk.Business.Services.Abstract;
using FixDesk.DataAccess.Abstract;
using FixDesk.Entities;
using FixDesk.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace FixDesk.Business.Services.Concrete;

public class TicketService : ITicketService
{
    private readonly IGenericRepository<Ticket> _ticketRepo;
    private readonly IGenericRepository<User> _userRepo;
    private readonly IGenericRepository<Branch> _branchRepo;
    private readonly IGenericRepository<Category> _categoryRepo;
    private readonly IGenericRepository<TicketComment> _commentRepo;
    private readonly ITelegramBotService _telegramBotService;

    public TicketService(
        IGenericRepository<Ticket> ticketRepo,
        IGenericRepository<User> userRepo,
        IGenericRepository<Branch> branchRepo,
        IGenericRepository<Category> categoryRepo,
        IGenericRepository<TicketComment> commentRepo,
        ITelegramBotService telegramBotService)
    {
        _ticketRepo = ticketRepo;
        _userRepo = userRepo;
        _branchRepo = branchRepo;
        _categoryRepo = categoryRepo;
        _commentRepo = commentRepo;
        _telegramBotService = telegramBotService;
    }

    public async Task<ServiceResult<TicketDto>> CreateTicketAsync(CreateTicketDto dto, int currentUserId)
    {
        var category = await _categoryRepo.GetByIdAsync(dto.CategoryId);
        if (category == null) return ServiceResult<TicketDto>.Failure("Seçilmiş kateqoriya tapılmadı.");

        var branch = await _branchRepo.GetByIdAsync(dto.BranchId);
        if (branch == null) return ServiceResult<TicketDto>.Failure("Seçilmiş filial tapılmadı.");

        var user = await _userRepo.GetByIdAsync(currentUserId);
        if (user == null) return ServiceResult<TicketDto>.Failure("İstifadəçi tapılmadı.");

        DateTime now = DateTime.UtcNow;
        DateTime slaDueDate = dto.Priority switch
        {
            TicketPriority.Urgent => now.AddHours(2),
            TicketPriority.High => now.AddHours(8),
            TicketPriority.Medium => now.AddHours(24),
            TicketPriority.Low => now.AddHours(48),
            _ => now.AddHours(24)
        };

        var ticketCount = (await _ticketRepo.GetAllAsync()).Count() + 1;
        var ticketNumber = $"TICK-{now.Year}-{ticketCount:D4}";

        var ticket = new Ticket
        {
            TicketNumber = ticketNumber,
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            Status = TicketStatus.New,
            CategoryId = dto.CategoryId,
            BranchId = dto.BranchId,
            CreatedByUserId = currentUserId,
            SlaDueDate = slaDueDate,
            IsSlaBreached = false
        };

        await _ticketRepo.AddAsync(ticket);
        await _ticketRepo.SaveChangesAsync();

        // Send Telegram Notification
        await _telegramBotService.SendNewTicketNotificationAsync(
            ticket.TicketNumber,
            ticket.Title,
            category.Name,
            ticket.Priority.ToString(),
            branch.Name,
            user.FullName);

        var resultDto = await MapToTicketDtoAsync(ticket.Id);
        return ServiceResult<TicketDto>.Success(resultDto!, "Müraciət uğurla yaradıldı.");
    }

    public async Task<ServiceResult<TicketDto>> GetByIdAsync(int id, int currentUserId, UserRole currentRole, int? currentBranchId)
    {
        var dto = await MapToTicketDtoAsync(id);
        if (dto == null) return ServiceResult<TicketDto>.Failure("Müraciət tapılmadı.");

        if (currentRole == UserRole.BranchEmployee && dto.CreatedByUserId != currentUserId)
        {
            return ServiceResult<TicketDto>.Forbidden("Bu müraciətə baxmaq hüququnuz yoxdur.");
        }

        if (currentRole == UserRole.BranchManager && (!currentBranchId.HasValue || dto.BranchId != currentBranchId.Value))
        {
            return ServiceResult<TicketDto>.Forbidden("Yalnız öz filialınızın müraciətlərinə baxa bilərsiniz.");
        }

        if ((currentRole == UserRole.ITSpecialist || currentRole == UserRole.FieldEngineer) &&
            dto.AssignedToUserId != currentUserId && dto.Status != TicketStatus.New)
        {
            return ServiceResult<TicketDto>.Forbidden("Bu müraciətə baxmaq hüququnuz yoxdur.");
        }

        return ServiceResult<TicketDto>.Success(dto);
    }

    public async Task<ServiceResult<IEnumerable<TicketDto>>> GetAllTicketsAsync(
        TicketStatus? status = null,
        TicketPriority? priority = null,
        int? categoryId = null,
        int? branchId = null,
        int? assignedToUserId = null,
        int? createdByUserId = null,
        int? currentUserId = null,
        UserRole? currentRole = null,
        int? userBranchId = null)
    {
        var query = _ticketRepo.Query()
            .Include(t => t.Category)
            .Include(t => t.Branch)
            .Include(t => t.CreatedByUser)
            .Include(t => t.AssignedToUser)
            .Include(t => t.Comments).ThenInclude(c => c.User)
            .Include(t => t.Attachments)
            .AsQueryable();

        if (currentRole.HasValue)
        {
            switch (currentRole.Value)
            {
                case UserRole.BranchEmployee:
                    if (currentUserId.HasValue)
                    {
                        query = query.Where(t => t.CreatedByUserId == currentUserId.Value);
                    }
                    else
                    {
                        query = query.Where(t => false);
                    }
                    break;

                case UserRole.BranchManager:
                    if (userBranchId.HasValue)
                    {
                        query = query.Where(t => t.BranchId == userBranchId.Value);
                    }
                    else
                    {
                        query = query.Where(t => false);
                    }
                    break;

                case UserRole.ITSpecialist:
                case UserRole.FieldEngineer:
                    if (currentUserId.HasValue)
                    {
                        query = query.Where(t => t.AssignedToUserId == currentUserId.Value || t.Status == TicketStatus.New);
                    }
                    else
                    {
                        query = query.Where(t => t.Status == TicketStatus.New);
                    }
                    break;

                case UserRole.Admin:
                default:
                    break;
            }
        }

        if (status.HasValue) query = query.Where(t => t.Status == status.Value);
        if (priority.HasValue) query = query.Where(t => t.Priority == priority.Value);
        if (categoryId.HasValue) query = query.Where(t => t.CategoryId == categoryId.Value);
        if (branchId.HasValue) query = query.Where(t => t.BranchId == branchId.Value);
        if (assignedToUserId.HasValue) query = query.Where(t => t.AssignedToUserId == assignedToUserId.Value);
        if (createdByUserId.HasValue) query = query.Where(t => t.CreatedByUserId == createdByUserId.Value);

        var tickets = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();

        var now = DateTime.UtcNow;
        var dtos = tickets.Select(t => new TicketDto
        {
            Id = t.Id,
            TicketNumber = t.TicketNumber,
            Title = t.Title,
            Description = t.Description,
            Status = t.Status,
            Priority = t.Priority,
            CategoryId = t.CategoryId,
            CategoryName = t.Category?.Name ?? "",
            BranchId = t.BranchId,
            BranchName = t.Branch?.Name ?? "",
            CreatedByUserId = t.CreatedByUserId,
            CreatedByUserName = t.CreatedByUser?.FullName ?? "",
            AssignedToUserId = t.AssignedToUserId,
            AssignedToUserName = t.AssignedToUser?.FullName,
            ResolutionNotes = t.ResolutionNotes,
            SlaDueDate = t.SlaDueDate,
            IsSlaBreached = t.SlaDueDate.HasValue && t.SlaDueDate.Value < now && t.Status != TicketStatus.Resolved && t.Status != TicketStatus.Closed,
            CreatedAt = t.CreatedAt,
            ClosedAt = t.ClosedAt,
            Attachments = t.Attachments.Select(a => new TicketAttachmentDto
            {
                Id = a.Id,
                FileName = a.FileName,
                FilePath = a.FilePath,
                FileType = a.FileType
            }).ToList(),
            Comments = t.Comments.Select(c => new TicketCommentDto
            {
                Id = c.Id,
                UserId = c.UserId,
                UserName = c.User?.FullName ?? "",
                UserRole = c.User?.Role.ToString() ?? "",
                CommentText = c.CommentText,
                CreatedAt = c.CreatedAt
            }).OrderBy(c => c.CreatedAt).ToList()
        });

        return ServiceResult<IEnumerable<TicketDto>>.Success(dtos);
    }

    public async Task<ServiceResult<TicketDto>> ChangeStatusAsync(int ticketId, ChangeTicketStatusDto dto, int currentUserId)
    {
        var ticket = await _ticketRepo.GetByIdAsync(ticketId);
        if (ticket == null) return ServiceResult<TicketDto>.Failure("Müraciət tapılmadı.");

        ticket.Status = dto.Status;
        if (!string.IsNullOrWhiteSpace(dto.ResolutionNotes))
        {
            ticket.ResolutionNotes = dto.ResolutionNotes;
        }

        if (dto.Status == TicketStatus.Resolved || dto.Status == TicketStatus.Closed)
        {
            ticket.ClosedAt = DateTime.UtcNow;
        }

        _ticketRepo.Update(ticket);
        await _ticketRepo.SaveChangesAsync();

        // Send Telegram Notification
        await _telegramBotService.SendTicketStatusUpdateNotificationAsync(
            ticket.TicketNumber,
            ticket.Title,
            ticket.Status.ToString(),
            ticket.ResolutionNotes);

        var resultDto = await MapToTicketDtoAsync(ticket.Id);
        return ServiceResult<TicketDto>.Success(resultDto!, "Müraciət statusu dəyişdirildi.");
    }

    public async Task<ServiceResult<TicketDto>> AssignSpecialistAsync(int ticketId, int specialistUserId, int currentUserId)
    {
        var ticket = await _ticketRepo.GetByIdAsync(ticketId);
        if (ticket == null) return ServiceResult<TicketDto>.Failure("Müraciət tapılmadı.");

        var specialist = await _userRepo.GetByIdAsync(specialistUserId);
        if (specialist == null) return ServiceResult<TicketDto>.Failure("Təyin edilən mütəxəssis tapılmadı.");

        ticket.AssignedToUserId = specialistUserId;
        if (ticket.Status == TicketStatus.New)
        {
            ticket.Status = TicketStatus.InProgress;
        }

        _ticketRepo.Update(ticket);
        await _ticketRepo.SaveChangesAsync();

        // Send Telegram Notification
        await _telegramBotService.SendTicketAssignedNotificationAsync(
            ticket.TicketNumber,
            ticket.Title,
            specialist.FullName);

        var resultDto = await MapToTicketDtoAsync(ticket.Id);
        return ServiceResult<TicketDto>.Success(resultDto!, "Müraciət İT mütəxəssisinə təyin edildi.");
    }

    public async Task<ServiceResult<TicketCommentDto>> AddCommentAsync(int ticketId, AddCommentDto dto, int currentUserId)
    {
        var ticket = await _ticketRepo.GetByIdAsync(ticketId);
        if (ticket == null) return ServiceResult<TicketCommentDto>.Failure("Müraciət tapılmadı.");

        var user = await _userRepo.GetByIdAsync(currentUserId);
        if (user == null) return ServiceResult<TicketCommentDto>.Failure("İstifadəçi tapılmadı.");

        var comment = new TicketComment
        {
            TicketId = ticketId,
            UserId = currentUserId,
            CommentText = dto.CommentText
        };

        await _commentRepo.AddAsync(comment);
        await _commentRepo.SaveChangesAsync();

        var commentDto = new TicketCommentDto
        {
            Id = comment.Id,
            UserId = user.Id,
            UserName = user.FullName,
            UserRole = user.Role.ToString(),
            CommentText = comment.CommentText,
            CreatedAt = comment.CreatedAt
        };

        return ServiceResult<TicketCommentDto>.Success(commentDto, "Şərh əlavə edildi.");
    }

    private async Task<TicketDto?> MapToTicketDtoAsync(int ticketId)
    {
        var ticket = await _ticketRepo.Query(t => t.Id == ticketId)
            .Include(t => t.Category)
            .Include(t => t.Branch)
            .Include(t => t.CreatedByUser)
            .Include(t => t.AssignedToUser)
            .Include(t => t.Comments).ThenInclude(c => c.User)
            .Include(t => t.Attachments)
            .FirstOrDefaultAsync();

        if (ticket == null) return null;

        var now = DateTime.UtcNow;

        return new TicketDto
        {
            Id = ticket.Id,
            TicketNumber = ticket.TicketNumber,
            Title = ticket.Title,
            Description = ticket.Description,
            Status = ticket.Status,
            Priority = ticket.Priority,
            CategoryId = ticket.CategoryId,
            CategoryName = ticket.Category?.Name ?? "",
            BranchId = ticket.BranchId,
            BranchName = ticket.Branch?.Name ?? "",
            CreatedByUserId = ticket.CreatedByUserId,
            CreatedByUserName = ticket.CreatedByUser?.FullName ?? "",
            AssignedToUserId = ticket.AssignedToUserId,
            AssignedToUserName = ticket.AssignedToUser?.FullName,
            ResolutionNotes = ticket.ResolutionNotes,
            SlaDueDate = ticket.SlaDueDate,
            IsSlaBreached = ticket.SlaDueDate.HasValue && ticket.SlaDueDate.Value < now && ticket.Status != TicketStatus.Resolved && ticket.Status != TicketStatus.Closed,
            CreatedAt = ticket.CreatedAt,
            ClosedAt = ticket.ClosedAt,
            Attachments = ticket.Attachments.Select(a => new TicketAttachmentDto
            {
                Id = a.Id,
                FileName = a.FileName,
                FilePath = a.FilePath,
                FileType = a.FileType
            }).ToList(),
            Comments = ticket.Comments.Select(c => new TicketCommentDto
            {
                Id = c.Id,
                UserId = c.UserId,
                UserName = c.User?.FullName ?? "",
                UserRole = c.User?.Role.ToString() ?? "",
                CommentText = c.CommentText,
                CreatedAt = c.CreatedAt
            }).OrderBy(c => c.CreatedAt).ToList()
        };
    }
}

