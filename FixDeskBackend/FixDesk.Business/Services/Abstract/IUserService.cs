using FixDesk.Business.Common;
using FixDesk.Business.DTOs;
using FixDesk.Entities.Enums;

namespace FixDesk.Business.Services.Abstract;

public interface IUserService
{
    Task<ServiceResult<IEnumerable<UserDto>>> GetAllUsersAsync(UserRole? role = null, int? branchId = null);
    Task<ServiceResult<UserDto>> GetByIdAsync(int id);
}
