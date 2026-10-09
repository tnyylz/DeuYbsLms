// Path: DeuYbsLms.API/Controllers/QuizController.cs

using AutoMapper;
using DeuYbsLms.Application.DTOs.Course;
using DeuYbsLms.Application.Interfaces.Repositories;
using DeuYbsLms.Domain.Entities.Course;
using DeuYbsLms.Infrastructure.Persistence.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DeuYbsLms.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuizController : ControllerBase
{
    private readonly IQuizRepository _quizRepository;
    private readonly ILessonRepository _lessonRepository;
    private readonly IMapper _mapper;
    private readonly AppDbContext _context;

    public QuizController(IQuizRepository quizRepository, ILessonRepository lessonRepository, IMapper mapper, AppDbContext context)
    {
        _quizRepository = quizRepository;
        _lessonRepository = lessonRepository;
        _mapper = mapper;
        _context = context;
    }

    [Authorize(Roles = "Student,Teacher,Admin")]
    [HttpGet("lesson/{lessonId:guid}")]
    public async Task<IActionResult> GetByLesson(Guid lessonId)
    {
        var quiz = await _quizRepository.GetQuizByLessonIdAsync(lessonId);
        if (quiz == null) return NotFound("Bu ders için quiz bulunamadı.");
        
        // Map to Teacher-view DTO (Includes IsCorrect)
        var quizDto = _mapper.Map<QuizDto>(quiz);
        return Ok(quizDto);
    }

    [Authorize(Roles = "Student,Teacher,Admin")]
    [HttpGet("lesson/{lessonId:guid}/questions")]
    public async Task<IActionResult> GetQuestionsByLesson(Guid lessonId)
    {
        var quiz = await _quizRepository.GetQuizByLessonIdAsync(lessonId);
        if (quiz == null) return NotFound("Bu ders için quiz bulunamadı.");

        // Map to Student-view DTOs (Hides IsCorrect)
        var questions = _mapper.Map<List<StudentQuestionDto>>(quiz.Questions);
        return Ok(questions);
    }

    [Authorize(Roles = "Student,Teacher,Admin")]
    [HttpGet("course/{courseId:guid}")]
    public async Task<IActionResult> GetByCourse(Guid courseId)
    {
        var quiz = await _quizRepository.GetQuizByCourseIdAsync(courseId);
        if (quiz == null) return NotFound("Bu kurs için final sınavı bulunamadı.");
        
        var quizDto = _mapper.Map<QuizDto>(quiz);
        return Ok(quizDto);
    }

    [Authorize(Roles = "Student,Teacher,Admin")]
    [HttpGet("course/{courseId:guid}/questions")]
    public async Task<IActionResult> GetQuestionsByCourse(Guid courseId)
    {
        var quiz = await _quizRepository.GetQuizByCourseIdAsync(courseId);
        if (quiz == null) return NotFound("Bu kurs için final sınavı bulunamadı.");

        var questions = _mapper.Map<List<StudentQuestionDto>>(quiz.Questions);
        return Ok(questions);
    }

    [Authorize(Roles = "Teacher,Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateOrUpdate([FromBody] CreateQuizDto request)
    {
        try
        {
            if (request.LessonId == null && request.CourseId == null)
                return BadRequest("LessonId veya CourseId gereklidir.");

            // Eski quiz'i bul (soft-deleted olanları da dahil et, çünkü unique constraint hala geçerli)
            Quiz? existingQuiz = null;

            if (request.LessonId != null)
            {
                var lesson = await _lessonRepository.GetByIdAsync(request.LessonId.Value);
                if (lesson == null) return NotFound("Ders bulunamadı.");

                // Query filter'ı devre dışı bırakarak soft-deleted olanları da bul
                existingQuiz = await _context.Quizzes
                    .IgnoreQueryFilters()
                    .Include(q => q.Questions)
                        .ThenInclude(qs => qs.AnswerOptions)
                    .FirstOrDefaultAsync(q => q.LessonId == request.LessonId.Value);
            }
            else if (request.CourseId != null)
            {
                // Query filter'ı devre dışı bırakarak soft-deleted olanları da bul
                existingQuiz = await _context.Quizzes
                    .IgnoreQueryFilters()
                    .Include(q => q.Questions)
                        .ThenInclude(qs => qs.AnswerOptions)
                    .FirstOrDefaultAsync(q => q.CourseId == request.CourseId.Value);
            }
            
            if (existingQuiz != null)
            {
                // HARD DELETE: Soft delete unique constraint'i ihlal eder
                // Önce AnswerOptions, sonra Questions, sonra Quiz'i sil
                foreach (var question in existingQuiz.Questions)
                {
                    _context.AnswerOptions.RemoveRange(question.AnswerOptions);
                }
                _context.Questions.RemoveRange(existingQuiz.Questions);
                _context.Quizzes.Remove(existingQuiz);
                await _context.SaveChangesAsync();
            }

            // Create new quiz
            var quiz = _mapper.Map<Quiz>(request);
            quiz.Id = Guid.NewGuid();
            quiz.CreatedAt = DateTime.UtcNow;
            
            foreach (var q in quiz.Questions)
            {
                q.Id = Guid.NewGuid();
                q.QuizId = quiz.Id;
                q.CreatedAt = DateTime.UtcNow;
                foreach (var o in q.AnswerOptions)
                {
                    o.Id = Guid.NewGuid();
                    o.QuestionId = q.Id;
                    o.CreatedAt = DateTime.UtcNow;
                }
            }

            await _quizRepository.AddAsync(quiz);
            return Ok(quiz.Id);
        }
        catch (Exception ex)
        {
            var innerMsg = ex.InnerException?.Message ?? "Yok";
            return StatusCode(500, new { error = ex.Message, innerError = innerMsg, stack = ex.StackTrace });
        }
    }

    [Authorize(Roles = "Teacher,Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var quiz = await _quizRepository.GetByIdAsync(id);
        if (quiz == null) return NotFound("Quiz bulunamadı.");
        
        await _quizRepository.DeleteAsync(quiz);
        return NoContent();
    }
}
