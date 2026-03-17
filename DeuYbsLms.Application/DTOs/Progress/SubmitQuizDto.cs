// Path: DeuYbsLms.Application/DTOs/Progress/SubmitQuizDto.cs

namespace DeuYbsLms.Application.DTOs.Progress;

public class SubmitQuizDto
{
    public Guid LessonId { get; set; }
    public List<QuizAnswerDto> Answers { get; set; } = new();
}

public class QuizAnswerDto
{
    public Guid QuestionId { get; set; }
    public Guid SelectedAnswerOptionId { get; set; }
}