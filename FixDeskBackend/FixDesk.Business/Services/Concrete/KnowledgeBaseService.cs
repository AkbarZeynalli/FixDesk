using FixDesk.Business.Common;
using FixDesk.Business.DTOs;
using FixDesk.Business.Services.Abstract;
using FixDesk.DataAccess.Abstract;
using FixDesk.Entities;
using Microsoft.EntityFrameworkCore;

namespace FixDesk.Business.Services.Concrete;

public class KnowledgeBaseService : IKnowledgeBaseService
{
    private readonly IGenericRepository<KnowledgeBaseArticle> _articleRepo;
    private readonly IGenericRepository<Category> _categoryRepo;

    public KnowledgeBaseService(
        IGenericRepository<KnowledgeBaseArticle> articleRepo,
        IGenericRepository<Category> categoryRepo)
    {
        _articleRepo = articleRepo;
        _categoryRepo = categoryRepo;
    }

    public async Task<ServiceResult<IEnumerable<ArticleDto>>> SearchArticlesAsync(string? query = null, int? categoryId = null)
    {
        var dbQuery = _articleRepo.Query()
            .Include(a => a.Category)
            .Include(a => a.Author)
            .AsQueryable();

        if (categoryId.HasValue)
        {
            dbQuery = dbQuery.Where(a => a.CategoryId == categoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query))
        {
            var q = query.ToLower();
            dbQuery = dbQuery.Where(a => a.Title.ToLower().Contains(q) || a.Content.ToLower().Contains(q));
        }

        var articles = await dbQuery.OrderByDescending(a => a.ViewCount).ToListAsync();

        var dtos = articles.Select(a => new ArticleDto
        {
            Id = a.Id,
            Title = a.Title,
            Content = a.Content,
            CategoryId = a.CategoryId,
            CategoryName = a.Category?.Name ?? "",
            AuthorId = a.AuthorId,
            AuthorName = a.Author?.FullName ?? "",
            ViewCount = a.ViewCount,
            CreatedAt = a.CreatedAt
        });

        return ServiceResult<IEnumerable<ArticleDto>>.Success(dtos);
    }

    public async Task<ServiceResult<ArticleDto>> GetByIdAsync(int id)
    {
        var article = await _articleRepo.Query(a => a.Id == id)
            .Include(a => a.Category)
            .Include(a => a.Author)
            .FirstOrDefaultAsync();

        if (article == null) return ServiceResult<ArticleDto>.Failure("Məqalə tapılmadı.");

        article.ViewCount += 1;
        _articleRepo.Update(article);
        await _articleRepo.SaveChangesAsync();

        var dto = new ArticleDto
        {
            Id = article.Id,
            Title = article.Title,
            Content = article.Content,
            CategoryId = article.CategoryId,
            CategoryName = article.Category?.Name ?? "",
            AuthorId = article.AuthorId,
            AuthorName = article.Author?.FullName ?? "",
            ViewCount = article.ViewCount,
            CreatedAt = article.CreatedAt
        };

        return ServiceResult<ArticleDto>.Success(dto);
    }

    public async Task<ServiceResult<ArticleDto>> CreateAsync(CreateArticleDto dto, int authorId)
    {
        var category = await _categoryRepo.GetByIdAsync(dto.CategoryId);
        if (category == null) return ServiceResult<ArticleDto>.Failure("Seçilmiş kateqoriya tapılmadı.");

        var article = new KnowledgeBaseArticle
        {
            Title = dto.Title,
            Content = dto.Content,
            CategoryId = dto.CategoryId,
            AuthorId = authorId,
            ViewCount = 0
        };

        await _articleRepo.AddAsync(article);
        await _articleRepo.SaveChangesAsync();

        var resultDto = await GetByIdAsync(article.Id);
        return ServiceResult<ArticleDto>.Success(resultDto.Data!, "Məqalə uğurla əlavə edildi.");
    }
}
