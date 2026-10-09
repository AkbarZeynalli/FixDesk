using FixDesk.Business.Common;
using FixDesk.Business.DTOs;

namespace FixDesk.Business.Services.Abstract;

public interface IBranchService
{
    Task<ServiceResult<IEnumerable<BranchDto>>> GetAllAsync();
    Task<ServiceResult<BranchDto>> GetByIdAsync(int id);
    Task<ServiceResult<BranchDto>> CreateAsync(CreateBranchDto dto);
}
