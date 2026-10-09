using FixDesk.Business.Common;
using FixDesk.Business.DTOs;

namespace FixDesk.Business.Services.Abstract;

public interface IKnowledgeBaseService
{
    Task<ServiceResult<IEnumerable<ArticleDto>>> SearchArticlesAsync(string? query = null, int? categoryId = null);
    Task<ServiceResult<ArticleDto>> GetByIdAsync(int id);
    Task<ServiceResult<ArticleDto>> CreateAsync(CreateArticleDto dto, int authorId);
}
