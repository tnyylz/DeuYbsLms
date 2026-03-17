// Path: DeuYbsLms.Domain/Entities/Course/Question.cs

using DeuYbsLms.Domain.Entities.Common;

namespace DeuYbsLms.Domain.Entities.Course;

public class Question : BaseEntity
{
    public string QuestionText { get; set; } = string.Empty;
    public int OrderIndex { get; set; }

    public Guid QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;

    public ICollection<AnswerOption> AnswerOptions { get; set; } = new List<AnswerOption>();
}