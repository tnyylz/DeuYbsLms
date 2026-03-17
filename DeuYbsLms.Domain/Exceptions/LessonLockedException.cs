// Path: DeuYbsLms.Domain/Exceptions/LessonLockedException.cs

namespace DeuYbsLms.Domain.Exceptions;

// Öğrenci kilitli bir derse erişmeye çalışırsa fırlatılır.
// Kilit sisteminin uygulama kolu budur.
public class LessonLockedException : DomainException
{
    public LessonLockedException(string lessonTitle)
        : base($"'{lessonTitle}' dersi kilitli. Önce önceki dersi ve quizi tamamla.") { }
}