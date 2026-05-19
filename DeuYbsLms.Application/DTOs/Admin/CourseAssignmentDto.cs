using System.Collections.Generic;

namespace DeuYbsLms.Application.DTOs.Admin;

public class CourseAssignmentDto
{
    public int? GradeLevel { get; set; }
    public List<string>? StudentNumbers { get; set; }
}
