// Path: DeuYbsLms.Application/Common/Results/PaginatedResult.cs

namespace DeuYbsLms.Application.Common.Results;

// Listeleme endpoint'lerinde sayfalama için kullanılır.
// 1000 kursu tek seferde döndürmek yerine sayfa sayfa döndürürüz.
public class PaginatedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasNextPage => PageNumber < TotalPages;
    public bool HasPreviousPage => PageNumber > 1;
}