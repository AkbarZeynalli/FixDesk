using System.Linq.Expressions;
using FixDesk.DataAccess.Abstract;
using FixDesk.DataAccess.Context;
using FixDesk.Entities.Common;
using Microsoft.EntityFrameworkCore;

namespace FixDesk.DataAccess.Concrete;

public class GenericRepository<T> : IGenericRepository<T> where T : BaseEntity
{
    protected readonly FixDeskDbContext _context;

    public GenericRepository(FixDeskDbContext context)
    {
        _context = context;
    }

    public async Task<T?> GetByIdAsync(int id)
    {
        return await _context.Set<T>().FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);
    }

    public async Task<IEnumerable<T>> GetAllAsync(Expression<Func<T, bool>>? filter = null)
    {
        IQueryable<T> query = _context.Set<T>().Where(e => !e.IsDeleted);
        if (filter != null)
        {
            query = query.Where(filter);
        }
        return await query.ToListAsync();
    }

    public IQueryable<T> Query(Expression<Func<T, bool>>? filter = null)
    {
        IQueryable<T> query = _context.Set<T>().Where(e => !e.IsDeleted);
        if (filter != null)
        {
            query = query.Where(filter);
        }
        return query;
    }

    public async Task AddAsync(T entity)
    {
        await _context.Set<T>().AddAsync(entity);
    }

    public void Update(T entity)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        _context.Set<T>().Update(entity);
    }

    public void Delete(T entity)
    {
        entity.IsDeleted = true;
        entity.UpdatedAt = DateTime.UtcNow;
        _context.Set<T>().Update(entity);
    }

    public async Task<bool> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}
