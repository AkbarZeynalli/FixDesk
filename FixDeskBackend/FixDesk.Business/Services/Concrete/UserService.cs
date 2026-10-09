using FixDesk.Business.Common;
using FixDesk.Business.DTOs;
using FixDesk.Business.Services.Abstract;
using FixDesk.DataAccess.Abstract;
using FixDesk.Entities;
using FixDesk.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace FixDesk.Business.Services.Concrete;

public class UserService : IUserService
{
    private readonly IGenericRepository<User> _userRepo;

    public UserService(IGenericRepository<User> userRepo)
    {
        _userRepo = userRepo;
    }

    public async Task<ServiceResult<IEnumerable<UserDto>>> GetAllUsersAsync(UserRole? role = null, int? branchId = null)
    {
        var query = _userRepo.Query().Include(u => u.Branch).AsQueryable();

        if (role.HasValue) query = query.Where(u => u.Role == role.Value);
        if (branchId.HasValue) query = query.Where(u => u.BranchId == branchId.Value);

        var users = await query.ToListAsync();
        var dtos = users.Select(u => new UserDto
        {
            Id = u.Id,
            FullName = u.FullName,
            Email = u.Email,
            Phone = u.Phone,
            Role = u.Role,
            BranchId = u.BranchId,
            BranchName = u.Branch?.Name
        });

        return ServiceResult<IEnumerable<UserDto>>.Success(dtos);
    }

    public async Task<ServiceResult<UserDto>> GetByIdAsync(int id)
    {
        var user = await _userRepo.Query(u => u.Id == id).Include(u => u.Branch).FirstOrDefaultAsync();
        if (user == null) return ServiceResult<UserDto>.Failure("İstifadəçi tapılmadı.");

        var dto = new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            Role = user.Role,
            BranchId = user.BranchId,
            BranchName = user.Branch?.Name
        };

        return ServiceResult<UserDto>.Success(dto);
    }
}
