// Path: DeuYbsLms.Domain/Exceptions/NotFoundException.cs

namespace DeuYbsLms.Domain.Exceptions;

public class NotFoundException : DomainException
{
    public NotFoundException(string entityName, Guid id)
        : base($"'{entityName}' kaydı (ID: {id}) bulunamadı.") { }
}