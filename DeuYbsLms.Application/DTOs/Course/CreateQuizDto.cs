// Path: DeuYbsLms.Application/DTOs/Course/CreateQuizDto.cs

namespace DeuYbsLms.Application.DTOs.Course;

public class CreateQuizDto
{
    public string Title { get; set; } = string.Empty;
    public int MinimumPassingScore { get; set; } = 70;
    public Guid? LessonId { get; set; }
    public Guid? CourseId { get; set; }
    public List<CreateQuestionDto> Questions { get; set; } = new();
}

public class CreateQuestionDto
{
    public string QuestionText { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public List<CreateAnswerOptionDto> Options { get; set; } = new();
}

public class CreateAnswerOptionDto
{
    public string OptionText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}