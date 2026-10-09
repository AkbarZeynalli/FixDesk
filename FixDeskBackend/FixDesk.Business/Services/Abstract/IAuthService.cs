using FixDesk.Business.Common;
using FixDesk.Business.DTOs;

namespace FixDesk.Business.Services.Abstract;

public interface IAuthService
{
    Task<ServiceResult<AuthResponseDto>> LoginAsync(LoginDto loginDto);
    Task<ServiceResult<UserDto>> RegisterAsync(RegisterDto registerDto);
}
