// Path: DeuYbsLms.Domain/Entities/Gamification/XpTransaction.cs

using DeuYbsLms.Domain.Entities.Common;
using DeuYbsLms.Domain.Entities.Identity;

namespace DeuYbsLms.Domain.Entities.Gamification;

// XP Defteri: Her XP kazanımı buraya yazılır, hiç silinmez, güncellenmez.
// Event Sourcing pattern: TotalXp = tüm XpTransaction'ların toplamı
// Bu sayede "öğrenci nasıl bu XP'ye ulaştı?" sorusu her zaman cevaplanabilir.
public class XpTransaction : BaseEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    public int XpAmount { get; set; }
    public string Reason { get; set; } = string.Empty; // "SQL'e Giriş dersi tamamlandı"
    public Guid? SourceEntityId { get; set; }          // Hangi Lesson/Course tetikledi
    public int Amount { get; set; }
}