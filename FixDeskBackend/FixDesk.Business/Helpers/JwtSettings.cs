namespace FixDesk.Business.Helpers;

public class JwtSettings
{
    public string SecretKey { get; set; } = "FixDesk_Super_Secret_Security_Key_2026_Secure_Backend!";
    public string Issuer { get; set; } = "FixDeskBackend";
    public string Audience { get; set; } = "FixDeskClients";
    public int ExpirationInDays { get; set; } = 7;
}
