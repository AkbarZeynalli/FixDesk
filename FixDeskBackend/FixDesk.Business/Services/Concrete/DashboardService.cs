using FixDesk.Business.Common;
using FixDesk.Business.DTOs;
using FixDesk.Business.Services.Abstract;
using FixDesk.DataAccess.Abstract;
using FixDesk.Entities;
using FixDesk.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace FixDesk.Business.Services.Concrete;

public class DashboardService : IDashboardService
{
    private readonly IGenericRepository<Ticket> _ticketRepo;
    private readonly IGenericRepository<Branch> _branchRepo;
    private readonly IGenericRepository<Category> _categoryRepo;
    private readonly IGenericRepository<User> _userRepo;

    public DashboardService(
        IGenericRepository<Ticket> ticketRepo,
        IGenericRepository<Branch> branchRepo,
        IGenericRepository<Category> categoryRepo,
        IGenericRepository<User> userRepo)
    {
        _ticketRepo = ticketRepo;
        _branchRepo = branchRepo;
        _categoryRepo = categoryRepo;
        _userRepo = userRepo;
    }

    public async Task<ServiceResult<DashboardSummaryDto>> GetDashboardSummaryAsync()
    {
        var tickets = await _ticketRepo.Query()
            .Include(t => t.Branch)
            .Include(t => t.Category)
            .Include(t => t.AssignedToUser)
            .ToListAsync();

        var now = DateTime.UtcNow;

        var total = tickets.Count;
        var open = tickets.Count(t => t.Status == TicketStatus.New);
        var inProgress = tickets.Count(t => t.Status == TicketStatus.InProgress || t.Status == TicketStatus.PendingApproval);
        var resolved = tickets.Count(t => t.Status == TicketStatus.Resolved || t.Status == TicketStatus.Closed);
        var slaBreached = tickets.Count(t => t.SlaDueDate.HasValue && t.SlaDueDate.Value < now && t.Status != TicketStatus.Resolved && t.Status != TicketStatus.Closed);

        var branchStats = tickets
            .GroupBy(t => t.Branch?.Name ?? "Nəzərdə tutulmayıb")
            .Select(g => new BranchTicketCountDto
            {
                BranchName = g.Key,
                TicketCount = g.Count()
            })
            .OrderByDescending(b => b.TicketCount)
            .ToList();

        var categoryStats = tickets
            .GroupBy(t => t.Category?.Name ?? "Nəzərdə tutulmayıb")
            .Select(g => new CategoryTicketCountDto
            {
                CategoryName = g.Key,
                TicketCount = g.Count()
            })
            .OrderByDescending(c => c.TicketCount)
            .ToList();

        var specialists = await _userRepo.GetAllAsync(u => u.Role == UserRole.ITSpecialist || u.Role == UserRole.FieldEngineer);

        var specialistPerformances = new List<SpecialistPerformanceDto>();

        foreach (var spec in specialists)
        {
            var assignedTickets = tickets.Where(t => t.AssignedToUserId == spec.Id).ToList();
            var resolvedTickets = assignedTickets.Where(t => t.Status == TicketStatus.Resolved || t.Status == TicketStatus.Closed).ToList();

            double avgHours = 0;
            if (resolvedTickets.Any())
            {
                var totalHours = resolvedTickets
                    .Where(t => t.ClosedAt.HasValue)
                    .Sum(t => (t.ClosedAt!.Value - t.CreatedAt).TotalHours);

                avgHours = Math.Round(totalHours / resolvedTickets.Count, 1);
            }

            specialistPerformances.Add(new SpecialistPerformanceDto
            {
                SpecialistName = spec.FullName,
                TotalAssigned = assignedTickets.Count,
                ResolvedCount = resolvedTickets.Count,
                AverageResolutionTimeHours = avgHours
            });
        }

        var dto = new DashboardSummaryDto
        {
            TotalTickets = total,
            OpenTickets = open,
            InProgressTickets = inProgress,
            ResolvedTickets = resolved,
            SlaBreachedTickets = slaBreached,
            BranchStatistics = branchStats,
            CategoryStatistics = categoryStats,
            SpecialistPerformances = specialistPerformances
        };

        return ServiceResult<DashboardSummaryDto>.Success(dto);
    }
}
