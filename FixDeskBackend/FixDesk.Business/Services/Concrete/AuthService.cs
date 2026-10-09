using FixDesk.Business.Common;
using FixDesk.Business.DTOs;
using FixDesk.Business.Helpers;
using FixDesk.Business.Services.Abstract;
using FixDesk.DataAccess.Abstract;
using FixDesk.Entities;

namespace FixDesk.Business.Services.Concrete;

public class AuthService : IAuthService
{
    private readonly IGenericRepository<User> _userRepo;
    private readonly IGenericRepository<Branch> _branchRepo;
    private readonly JwtSettings _jwtSettings;

    public AuthService(
        IGenericRepository<User> userRepo,
        IGenericRepository<Branch> branchRepo,
        JwtSettings jwtSettings)
    {
        _userRepo = userRepo;
        _branchRepo = branchRepo;
        _jwtSettings = jwtSettings;
    }

    public async Task<ServiceResult<AuthResponseDto>> LoginAsync(LoginDto loginDto)
    {
        var users = await _userRepo.GetAllAsync(u => u.Email.ToLower() == loginDto.Email.ToLower());
        var user = users.FirstOrDefault();

        if (user == null || !SecurityHelper.VerifyPassword(loginDto.Password, user.PasswordHash))
        {
            return ServiceResult<AuthResponseDto>.Failure("E-poçt və ya şifrə yanlışdır.");
        }

        string? branchName = null;
        if (user.BranchId.HasValue)
        {
            var branch = await _branchRepo.GetByIdAsync(user.BranchId.Value);
            branchName = branch?.Name;
        }

        var token = SecurityHelper.GenerateJwtToken(user, _jwtSettings);

        var response = new AuthResponseDto
        {
            Token = token,
            Expiration = DateTime.UtcNow.AddDays(_jwtSettings.ExpirationInDays),
            User = new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role,
                BranchId = user.BranchId,
                BranchName = branchName
            }
        };

        return ServiceResult<AuthResponseDto>.Success(response, "Daxil olma uğurludur.");
    }

    public async Task<ServiceResult<UserDto>> RegisterAsync(RegisterDto registerDto)
    {
        var existing = await _userRepo.GetAllAsync(u => u.Email.ToLower() == registerDto.Email.ToLower());
        if (existing.Any())
        {
            return ServiceResult<UserDto>.Failure("Bu e-poçt ünvanı artıq istifadə olunur.");
        }

        string? branchName = null;
        if (registerDto.BranchId.HasValue)
        {
            var branch = await _branchRepo.GetByIdAsync(registerDto.BranchId.Value);
            if (branch == null)
            {
                return ServiceResult<UserDto>.Failure("Göstərilən filial tapılmadı.");
            }
            branchName = branch.Name;
        }

        var user = new User
        {
            FullName = registerDto.FullName,
            Email = registerDto.Email,
            PasswordHash = SecurityHelper.HashPassword(registerDto.Password),
            Phone = registerDto.Phone,
            Role = registerDto.Role,
            BranchId = registerDto.BranchId
        };

        await _userRepo.AddAsync(user);
        await _userRepo.SaveChangesAsync();

        var userDto = new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            Role = user.Role,
            BranchId = user.BranchId,
            BranchName = branchName
        };

        return ServiceResult<UserDto>.Success(userDto, "İstifadəçi uğurla qeydiyyatdan keçdi.");
    }
}
