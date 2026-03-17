// Path: DeuYbsLms.Domain/Exceptions/DomainException.cs

namespace DeuYbsLms.Domain.Exceptions;

// Tüm iş kuralı ihlallerinin ana exception'ı.
// API katmanı bunu yakalayıp 400 Bad Request döner.
public class DomainException : Exception
{
    public DomainException(string message) : base(message) { }
}