namespace FixDesk.Business.Helpers;

public class TelegramBotSettings
{
    public string BotToken { get; set; } = string.Empty;
    public string DefaultChatId { get; set; } = string.Empty;
    public bool Enabled { get; set; } = false;
}

