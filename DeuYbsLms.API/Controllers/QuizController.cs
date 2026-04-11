// Path: DeuYbsLms.API/Controllers/QuizController.cs

using AutoMapper;
using DeuYbsLms.Application.DTOs.Course;
using DeuYbsLms.Application.Interfaces.Repositories;
using DeuYbsLms.Domain.Entities.Course;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DeuYbsLms.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Teacher")]
public class QuizController : ControllerBase
{
    private readonly IQuizRepository _quizRepository;
    private readonly ILessonRepository _lessonRepository;
    private readonly IMapper _mapper;

    public QuizController(IQuizRepository quizRepository, ILessonRepository lessonRepository, IMapper mapper)
    {
        _quizRepository = quizRepository;
        _lessonRepository = lessonRepository;
        _mapper = mapper;
    }

    [HttpGet("lesson/{lessonId:guid}")]
    public async Task<IActionResult> GetByLesson(Guid lessonId)
    {
        var quiz = await _quizRepository.GetQuizByLessonIdAsync(lessonId);
        if (quiz == null) return NotFound("Bu ders için quiz bulunamadı.");
        return Ok(quiz);
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrUpdate([FromBody] CreateQuizDto request)
    {
        var lesson = await _lessonRepository.GetByIdAsync(request.LessonId);
        if (lesson == null) return NotFound("Ders bulunamadı.");

        var existingQuiz = await _quizRepository.GetQuizByLessonIdAsync(request.LessonId);
        
        if (existingQuiz != null)
        {
            // Update existing quiz
            _mapper.Map(request, existingQuiz);
            existingQuiz.UpdatedAt = DateTime.UtcNow;
            await _quizRepository.UpdateAsync(existingQuiz);
            return Ok(existingQuiz.Id);
        }
        else
        {
            // Create new quiz
            var quiz = _mapper.Map<Quiz>(request);
            quiz.Id = Guid.NewGuid();
            quiz.CreatedAt = DateTime.UtcNow;
            
            // Generate IDs for questions and options if not present
            foreach (var q in quiz.Questions)
            {
                q.Id = Guid.NewGuid();
                q.QuizId = quiz.Id;
                foreach (var o in q.AnswerOptions)
                {
                    o.Id = Guid.NewGuid();
                    o.QuestionId = q.Id;
                }
            }

            await _quizRepository.AddAsync(quiz);
            return Ok(quiz.Id);
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var quiz = await _quizRepository.GetByIdAsync(id);
        if (quiz == null) return NotFound("Quiz bulunamadı.");
        
        await _quizRepository.DeleteAsync(quiz);
        return NoContent();
    }
}
