// Path: DeuYbsLms.Application/DTOs/Course/QuizResponseDtos.cs

using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace DeuYbsLms.Application.DTOs.Course;

/// <summary>
/// Full Quiz DTO for Teachers (Includes IsCorrect)
/// </summary>
public class QuizDto
{
    public Guid Id { get; set; }
    
    [JsonPropertyName("minimumPassingScore")]
    public int MinimumPassingScore { get; set; }
    
    [JsonPropertyName("questions")]
    public List<TeacherQuestionDto> Questions { get; set; } = new();
}

public class TeacherQuestionDto
{
    public Guid Id { get; set; }
    
    [JsonPropertyName("questionText")]
    public string QuestionText { get; set; } = string.Empty;
    
    [JsonPropertyName("options")]
    public List<TeacherAnswerOptionDto> Options { get; set; } = new();
}

public class TeacherAnswerOptionDto
{
    public Guid Id { get; set; }
    
    [JsonPropertyName("optionText")]
    public string OptionText { get; set; } = string.Empty;
    
    [JsonPropertyName("isCorrect")]
    public bool IsCorrect { get; set; }
}

/// <summary>
/// Safe Quiz DTO for Students (Excludes IsCorrect)
/// </summary>
public class StudentQuestionDto
{
    public Guid Id { get; set; }
    
    [JsonPropertyName("questionText")]
    public string QuestionText { get; set; } = string.Empty;
    
    [JsonPropertyName("options")]
    public List<StudentAnswerOptionDto> Options { get; set; } = new();
}

public class StudentAnswerOptionDto
{
    public Guid Id { get; set; }
    
    [JsonPropertyName("optionText")]
    public string OptionText { get; set; } = string.Empty;
}
