// Path: DeuYbsLms.Domain/Entities/Course/AnswerOption.cs

using DeuYbsLms.Domain.Entities.Common;

namespace DeuYbsLms.Domain.Entities.Course;

public class AnswerOption : BaseEntity
{
    public string OptionText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; } // Her Question için sadece 1 tane true olmalı

    public Guid QuestionId { get; set; }
    public Question Question { get; set; } = null!;
}