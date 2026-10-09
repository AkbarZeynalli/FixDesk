using FixDesk.Business.Common;
using FixDesk.Business.DTOs;
using FixDesk.Business.Services.Abstract;
using FixDesk.DataAccess.Abstract;
using FixDesk.Entities;
using Microsoft.EntityFrameworkCore;

namespace FixDesk.Business.Services.Concrete;

public class BranchService : IBranchService
{
    private readonly IGenericRepository<Branch> _branchRepo;

    public BranchService(IGenericRepository<Branch> branchRepo)
    {
        _branchRepo = branchRepo;
    }

    public async Task<ServiceResult<IEnumerable<BranchDto>>> GetAllAsync()
    {
        var branches = await _branchRepo.Query()
            .Include(b => b.Users)
            .Include(b => b.Tickets)
            .ToListAsync();

        var dtos = branches.Select(b => new BranchDto
        {
            Id = b.Id,
            Name = b.Name,
            Code = b.Code,
            Address = b.Address,
            Phone = b.Phone,
            UserCount = b.Users.Count(u => !u.IsDeleted),
            TicketCount = b.Tickets.Count(t => !t.IsDeleted)
        });

        return ServiceResult<IEnumerable<BranchDto>>.Success(dtos);
    }

    public async Task<ServiceResult<BranchDto>> GetByIdAsync(int id)
    {
        var branch = await _branchRepo.Query(b => b.Id == id)
            .Include(b => b.Users)
            .Include(b => b.Tickets)
            .FirstOrDefaultAsync();

        if (branch == null) return ServiceResult<BranchDto>.Failure("Filial tapılmadı.");

        var dto = new BranchDto
        {
            Id = branch.Id,
            Name = branch.Name,
            Code = branch.Code,
            Address = branch.Address,
            Phone = branch.Phone,
            UserCount = branch.Users.Count(u => !u.IsDeleted),
            TicketCount = branch.Tickets.Count(t => !t.IsDeleted)
        };

        return ServiceResult<BranchDto>.Success(dto);
    }

    public async Task<ServiceResult<BranchDto>> CreateAsync(CreateBranchDto dto)
    {
        var existing = await _branchRepo.GetAllAsync(b => b.Code.ToLower() == dto.Code.ToLower());
        if (existing.Any()) return ServiceResult<BranchDto>.Failure("Bu kodla filial artıq mövcuddur.");

        var branch = new Branch
        {
            Name = dto.Name,
            Code = dto.Code,
            Address = dto.Address,
            Phone = dto.Phone
        };

        await _branchRepo.AddAsync(branch);
        await _branchRepo.SaveChangesAsync();

        var resultDto = new BranchDto
        {
            Id = branch.Id,
            Name = branch.Name,
            Code = branch.Code,
            Address = branch.Address,
            Phone = branch.Phone,
            UserCount = 0,
            TicketCount = 0
        };

        return ServiceResult<BranchDto>.Success(resultDto, "Filial yaradıldı.");
    }
}
