using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Application.DTOs.Course;

namespace DeuYbsLms.Application.Abstractions.Services;

public interface ILearningPathService
{
    Task<List<LearningPathDto>> GetAllPathsAsync(bool onlyPublished = true);
    Task<LearningPathDto> GetPathByIdAsync(Guid pathId);
    
    // Teacher Management
    Task<Result<List<LearningPathDto>>> GetTeacherPathsAsync(Guid teacherId);
    Task<Result<Guid>> CreatePathAsync(Guid teacherId, CreateLearningPathDto dto);
    Task<Result<bool>> UpdatePathAsync(Guid teacherId, Guid pathId, CreateLearningPathDto dto);
    Task<Result<bool>> DeletePathAsync(Guid teacherId, Guid pathId);

    Task SeedDefaultPathsAsync();
}
