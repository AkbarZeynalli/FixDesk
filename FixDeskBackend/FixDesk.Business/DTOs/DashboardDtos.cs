namespace FixDesk.Business.DTOs;

public class DashboardSummaryDto
{
    public int TotalTickets { get; set; }
    public int OpenTickets { get; set; }
    public int InProgressTickets { get; set; }
    public int ResolvedTickets { get; set; }
    public int SlaBreachedTickets { get; set; }
    public List<BranchTicketCountDto> BranchStatistics { get; set; } = new();
    public List<CategoryTicketCountDto> CategoryStatistics { get; set; } = new();
    public List<SpecialistPerformanceDto> SpecialistPerformances { get; set; } = new();
}

public class BranchTicketCountDto
{
    public string BranchName { get; set; } = string.Empty;
    public int TicketCount { get; set; }
}

public class CategoryTicketCountDto
{
    public string CategoryName { get; set; } = string.Empty;
    public int TicketCount { get; set; }
}

public class SpecialistPerformanceDto
{
    public string SpecialistName { get; set; } = string.Empty;
    public int TotalAssigned { get; set; }
    public int ResolvedCount { get; set; }
    public double AverageResolutionTimeHours { get; set; }
}
