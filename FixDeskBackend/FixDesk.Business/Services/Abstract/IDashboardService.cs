using FixDesk.Business.Common;
using FixDesk.Business.DTOs;

namespace FixDesk.Business.Services.Abstract;

public interface IDashboardService
{
    Task<ServiceResult<DashboardSummaryDto>> GetDashboardSummaryAsync();
}
