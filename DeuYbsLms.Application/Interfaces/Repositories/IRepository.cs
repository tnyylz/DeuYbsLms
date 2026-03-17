// Path: DeuYbsLms.Application/Interfaces/Repositories/IRepository.cs

using DeuYbsLms.Domain.Entities.Common;
using System.Linq.Expressions;

namespace DeuYbsLms.Application.Interfaces.Repositories;

public interface IRepository<T> where T : BaseEntity
{
    // Tekil sorgular
    Task<T?> GetByIdAsync(Guid id);
    Task<T?> GetAsync(Expression<Func<T, bool>> predicate);

    // Çoğul sorgular
    Task<List<T>> GetAllAsync();
    Task<List<T>> GetAllAsync(Expression<Func<T, bool>> predicate);

    // Yazma işlemleri
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(T entity); // Soft delete uygular

    // Yardımcılar
    Task<bool> AnyAsync(Expression<Func<T, bool>> predicate);
    Task<int> CountAsync(Expression<Func<T, bool>> predicate);
}