// Path: DeuYbsLms.Domain/Entities/Common/BaseEntity.cs

namespace DeuYbsLms.Domain.Entities.Common;

public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Soft Delete: Veriyi fiziksel silmiyoruz, sadece gizliyoruz.
    // Öğrenci sertifikası olan bir dersi teacher silse bile kayıt kaybolmaz.
    public bool IsDeleted { get; set; } = false;
}