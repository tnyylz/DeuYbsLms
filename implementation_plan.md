# Lig Sisteminin Kaldırılıp Saf XP/Level Sistemine Geçiş Planı

Kullanıcı talebi doğrultusunda gamification (oyunlaştırma) mimarisi basitleştirilecek; mevcut Lig (League) sistemi tamamen projeden çıkartılarak odak noktası saf XP ve artan zorluktaki Seviye (Level) sistemine kaydırılacaktır.

## ⚠️ Kullanıcı Geri Bildirimi Gerekli (User Review Required)
> [!IMPORTANT]
> Bu işlem veritabanından ve kod tabanından Ligler ile ilgili (LeagueGroup, LeagueParticipation vb.) tüm tabloların ve kayıtların **KALICI OLARAK SİLİNMESİNİ** gerektiren büyük bir işlemdir.
> Lütfen planı inceleyip onay verin.

---

## Önerilen Değişiklikler

### 1. Domain Katmanı (Veritabanı Modellerinin Temizlenmesi)
Lig sistemine ait tüm sınıflar silinecek.

#### [DELETE] Silinecek Dosyalar
- `DeuYbsLms.Domain/Entities/Gamification/LeagueGroup.cs`
- `DeuYbsLms.Domain/Entities/Gamification/LeagueParticipation.cs`
- `DeuYbsLms.Domain/Enums/LeagueTier.cs`

#### [MODIFY] `StudentProfile.cs`
- `CurrentLeagueTier` ve `LeagueParticipations` property'leri **SİLİNECEK**.
- Mevcut `CurrentLevel`, `TotalXp` ve `XpToNextLevel` alanları **KORUNACAK**.

---

### 2. Infrastructure Katmanı (Veritabanı ve Arka Plan İşleri)

#### [MODIFY] `AppDbContext.cs`
- `LeagueGroups` ve `LeagueParticipations` DbSet'leri silinecek.
- Veritabanından tabloları uçurmak için bir Entity Framework **Migration** oluşturulup veritabanı güncellenecek (`Update-Database`).

#### [DELETE] Silinecek Dosyalar (Background Workers)
- `DeuYbsLms.Infrastructure/BackgroundJobs/LeagueSeasonWorker.cs` (Haftalık lig hesaplama işi tamamen kaldırılacak).
- Bu servisin programın başlangıcında kaydedildiği yerler (Dependency Injection kayıtları) temizlenecek.

---

### 3. Application Katmanı (Servislerin Temizlenmesi ve Güncellenmesi)

#### [DELETE] Silinecek Dosyalar
- `ILeagueService.cs` (Arayüz)
- `LeagueService.cs` (Uygulama)

#### [MODIFY] `GamificationService.cs`
- İçerisindeki `_leagueService` bağımlılıkları silinecek.
- `AwardXpAsync` metodunda seviye atlama formülü (örneğin: `XpToNextLevel = CurrentLevel * 500`) giderek zorlaşacak şekilde korunacak/iyileştirilecek. (Mevcutta `1.2` çarpanı ile zorlaşıyordu, bu formül matematiksel olarak güçlendirilebilir).

#### [MODIFY] DTO'lar (Data Transfer Objects)
- `StudentGamificationDto` ve `LeaderboardDto` içindeki `LeagueTier`, `LeagueRank` gibi tüm lig alanları kaldırılacak.

---

### 4. Frontend (UI) Katmanı

Tüm arayüzlerde ligle alakalı bileşenler kaldırılacak ve ağırlık seviye ikonlarına/grafiklerine verilecek.

#### [MODIFY] `StudentDashboard.tsx`
- Öğrenci panelinde sağ tarafta bulunan veya ortada yer alan "Lig" kutucuğu tamamen kaldırılacak.
- Bunun yerine XP Barı ve mevcut Seviye ekranın yıldızı olacak.

#### [MODIFY] `Leaderboard` bileşenleri (`AdminDashboard.tsx`, `TeacherDashboard.tsx`, `StudentDashboard.tsx`)
- Sıralama mantığı tamamen `Level` ve `TotalXp` ikilisine dayalı olacak. Tablolardaki "Lig" sütunları temizlenecek.

---

## Doğrulama Planı (Verification Plan)

### Otomatik/Backend Testleri
1. Projenin derlenmesi (`dotnet build`) ile hiçbir "ILeagueService bulunamadı" hatası alınmadığı kontrol edilecek.
2. Background service'in sisteme yük getirmeden tamamen devreden çıktığı doğrulanacak.
3. XP verildiğinde Level'ın logaritmik veya kademeli olarak zorlaşarak arttığı loglardan veya test API'sinden denenecek.

### Manuel Doğrulama
1. **Frontend Öğrenci Paneli:** Ekranda "Demir, Gümüş" gibi lig ibarelerinin yerini sadece "Seviye 5" gibi saf göstergelerin aldığı kontrol edilecek.
2. **Kapanış (Crash) Testi:** Lig datası bekleyen eski endpoint'lerin çökmediği kontrol edilecek.
