using FixDesk.Business.Common;
using FixDesk.Business.DTOs;

namespace FixDesk.Business.Services.Abstract;

public interface ICategoryService
{
    Task<ServiceResult<IEnumerable<CategoryDto>>> GetAllAsync();
    Task<ServiceResult<CategoryDto>> CreateAsync(CreateCategoryDto dto);
}
