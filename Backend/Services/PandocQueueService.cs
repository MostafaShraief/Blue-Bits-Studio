using System.Threading.Channels;
using BlueBits.Api.Services.Interfaces;

namespace BlueBits.Api.Services;

public class QueuedPandocRequest
{
    public required string MarkdownText { get; init; }
    public required string TemplateName { get; init; }
    public required string MaterialName { get; init; }
    public required string Type { get; init; }
    public required string LectureNumber { get; init; }
    public required string ContentRootPath { get; init; }
    public required TaskCompletionSource<PandocResult> CompletionSource { get; init; }
    public CancellationToken CancellationToken { get; init; }
}

public class PandocQueueService : BackgroundService
{
    private readonly Channel<QueuedPandocRequest> _channel;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<PandocQueueService> _logger;

    private static readonly TimeSpan RequestTimeout = TimeSpan.FromMinutes(5);

    public PandocQueueService(IServiceProvider serviceProvider, ILogger<PandocQueueService> logger)
    {
        _channel = Channel.CreateBounded<QueuedPandocRequest>(new BoundedChannelOptions(100)
        {
            SingleReader = true,
            FullMode = BoundedChannelFullMode.Wait
        });
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task<PandocResult> EnqueueGenerateDocxAsync(
        string markdownText,
        string templateName,
        string materialName,
        string type,
        string lectureNumber,
        string contentRootPath,
        CancellationToken cancellationToken)
    {
        var tcs = new TaskCompletionSource<PandocResult>(TaskCreationOptions.RunContinuationsAsynchronously);
        var request = new QueuedPandocRequest
        {
            MarkdownText = markdownText,
            TemplateName = templateName,
            MaterialName = materialName,
            Type = type,
            LectureNumber = lectureNumber,
            ContentRootPath = contentRootPath,
            CompletionSource = tcs,
            CancellationToken = cancellationToken
        };

        await _channel.Writer.WriteAsync(request, cancellationToken);

        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(RequestTimeout);

        try
        {
            return await tcs.Task.WaitAsync(cts.Token);
        }
        catch (OperationCanceledException)
        {
            return new PandocResult
            {
                Success = false,
                Error = "لم يكتمل التحويل خلال المهلة المحددة",
                Details = "تمت إضافة طلب إنشاء المستند إلى قائمة الانتظار ولكن المهلة الزمنية انتهت بعد 5 دقائق. قد يكون السبب حجم المستند الكبير أو ارتفاع تحميل الخادم. يرجى المحاولة مرة أخرى."
            };
        }
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("PandocQueueService started. Concurrency: 1, Queue capacity: 100");

        await foreach (var request in _channel.Reader.ReadAllAsync(stoppingToken))
        {
            var queueDepth = _channel.Reader.Count;
            _logger.LogInformation(
                "Processing Pandoc request for {MaterialName} Lecture {LectureNumber}. Queue depth: {QueueDepth}",
                request.MaterialName, request.LectureNumber, queueDepth);

            try
            {
                using var scope = _serviceProvider.CreateScope();
                var pandocService = scope.ServiceProvider.GetRequiredService<IPandocService>();

                var result = await pandocService.GenerateDocxAsync(
                    request.MarkdownText,
                    request.TemplateName,
                    request.MaterialName,
                    request.Type,
                    request.LectureNumber,
                    request.ContentRootPath,
                    request.CancellationToken);

                request.CompletionSource.TrySetResult(result);
            }
            catch (OperationCanceledException)
            {
                request.CompletionSource.TrySetResult(new PandocResult
                {
                    Success = false,
                    Error = "تم إلغاء الطلب",
                    Details = "تم إلغاء طلب إنشاء المستند."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Pandoc generation failed for {MaterialName} Lecture {LectureNumber}",
                    request.MaterialName, request.LectureNumber);
                request.CompletionSource.TrySetResult(new PandocResult
                {
                    Success = false,
                    Error = "فشل إنشاء المستند",
                    Details = ex.Message
                });
            }

            await Task.Yield();
        }
    }
}
