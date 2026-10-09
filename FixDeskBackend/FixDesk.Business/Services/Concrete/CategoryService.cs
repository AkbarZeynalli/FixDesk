using FixDesk.Business.Common;
using FixDesk.Business.DTOs;
using FixDesk.Business.Services.Abstract;
using FixDesk.DataAccess.Abstract;
using FixDesk.Entities;

namespace FixDesk.Business.Services.Concrete;

public class CategoryService : ICategoryService
{
    private readonly IGenericRepository<Category> _categoryRepo;

    public CategoryService(IGenericRepository<Category> categoryRepo)
    {
        _categoryRepo = categoryRepo;
    }

    public async Task<ServiceResult<IEnumerable<CategoryDto>>> GetAllAsync()
    {
        var categories = await _categoryRepo.GetAllAsync();
        var dtos = categories.Select(c => new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            Type = c.Type
        });

        return ServiceResult<IEnumerable<CategoryDto>>.Success(dtos);
    }

    public async Task<ServiceResult<CategoryDto>> CreateAsync(CreateCategoryDto dto)
    {
        var category = new Category
        {
            Name = dto.Name,
            Description = dto.Description,
            Type = dto.Type
        };

        await _categoryRepo.AddAsync(category);
        await _categoryRepo.SaveChangesAsync();

        var result = new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            Type = category.Type
        };

        return ServiceResult<CategoryDto>.Success(result, "Kateqoriya yaradıldı.");
    }
}
