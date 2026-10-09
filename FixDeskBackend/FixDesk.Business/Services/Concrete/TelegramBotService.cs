using FixDesk.Business.Helpers;
using FixDesk.Business.Services.Abstract;
using Microsoft.Extensions.Logging;
using Telegram.Bot;
using Telegram.Bot.Types.Enums;

namespace FixDesk.Business.Services.Concrete;

public class TelegramBotService : ITelegramBotService
{
    private readonly TelegramBotSettings _settings;
    private readonly ILogger<TelegramBotService> _logger;
    private readonly TelegramBotClient? _botClient;

    public TelegramBotService(TelegramBotSettings settings, ILogger<TelegramBotService> logger)
    {
        _settings = settings;
        _logger = logger;

        if (_settings.Enabled && !string.IsNullOrWhiteSpace(_settings.BotToken))
        {
            try
            {
                _botClient = new TelegramBotClient(_settings.BotToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Telegram bot client initializasiyasında xəta.");
                Console.WriteLine($"[TELEGRAM INIT ERROR]: {ex.Message}");
            }
        }
    }

    public async Task SendNotificationAsync(string message, string? chatId = null)
    {
        if (_botClient == null || !_settings.Enabled)
        {
            Console.WriteLine("[TELEGRAM]: Bot client is null or disabled.");
            return;
        }

        var targetChatId = chatId ?? _settings.DefaultChatId;
        if (string.IsNullOrWhiteSpace(targetChatId))
        {
            Console.WriteLine("[TELEGRAM]: TargetChatId is empty.");
            return;
        }

        try
        {
            await _botClient.SendTextMessageAsync(
                chatId: targetChatId,
                text: message,
                parseMode: ParseMode.Html);
            
            Console.WriteLine($"[TELEGRAM SUCCESS]: Message sent to chat {targetChatId}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Telegram bildirişi göndərilərkən xəta baş verdi.");
            Console.WriteLine($"[TELEGRAM ERROR]: {ex.Message}");
        }
    }

    public async Task SendNewTicketNotificationAsync(string ticketNumber, string title, string category, string priority, string branchName, string createdBy)
    {
        var msg = $"<b>🆕 YENİ MÜRACİƏT (TICKET)</b>\n\n" +
                  $"<b>№:</b> <code>{ticketNumber}</code>\n" +
                  $"<b>Başlıq:</b> {title}\n" +
                  $"<b>Kateqoriya:</b> {category}\n" +
                  $"<b>Prioritet:</b> ⚡ {priority}\n" +
                  $"<b>Filial:</b> 🏛 {branchName}\n" +
                  $"<b>Müraciət edən:</b> 👤 {createdBy}\n\n" +
                  $"<i>Zəhmət olmasa İT panelindən baxın və icraya götürün.</i>";

        await SendNotificationAsync(msg);
    }

    public async Task SendTicketStatusUpdateNotificationAsync(string ticketNumber, string title, string newStatus, string? resolutionNotes)
    {
        var msg = $"<b>🔄 STATUS YENİLƏNDİ</b>\n\n" +
                  $"<b>Müraciət №:</b> <code>{ticketNumber}</code>\n" +
                  $"<b>Başlıq:</b> {title}\n" +
                  $"<b>Yeni Status:</b> 📌 <b>{newStatus}</b>\n";

        if (!string.IsNullOrWhiteSpace(resolutionNotes))
        {
            msg += $"<b>Həll Qeydi:</b> 📝 {resolutionNotes}\n";
        }

        await SendNotificationAsync(msg);
    }

    public async Task SendTicketAssignedNotificationAsync(string ticketNumber, string title, string specialistName)
    {
        var msg = $"<b>👨‍💻 İCRACI TƏYİN EDİLDİ</b>\n\n" +
                  $"<b>Müraciət №:</b> <code>{ticketNumber}</code>\n" +
                  $"<b>Başlıq:</b> {title}\n" +
                  $"<b>Təyin olunan İT Mütəxəssis:</b> 🧑‍💻 {specialistName}";

        await SendNotificationAsync(msg);
    }
}

