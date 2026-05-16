using BlueBits.Api.Services.Interfaces;

namespace BlueBits.Api.Endpoints;

public static class MergeEndpoints
{
    public static RouteGroupBuilder MapMergeEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/test", () => Results.Ok("Merge endpoint working"));

        group.MapPost("/execute", async (
            HttpRequest request,
            IMergeService mergeService,
            IWebHostEnvironment env) =>
        {
            if (!request.HasFormContentType) return Results.BadRequest(new { error = "Expected form data." });

            var form = await request.ReadFormAsync();
            var files = form.Files.GetFiles("files");
            if (files == null || files.Count == 0)
                return Results.BadRequest(new { error = "يجب رفع ملف واحد على الأقل." });
            if (files.Count < 2)
                return Results.BadRequest(new { error = "يجب رفع ملفين على الأقل للدمج." });

            var materialName = form["materialName"].ToString() ?? "";
            if (string.IsNullOrWhiteSpace(materialName))
                return Results.BadRequest(new { error = "اسم المادة مطلوب." });

            var lectureTypeRaw = form["lectureType"].ToString() ?? "";
            var lectureType = string.IsNullOrEmpty(lectureTypeRaw) ? "theoretical" : lectureTypeRaw;

            var result = await mergeService.MergeDocxFilesAsync(files, materialName, lectureType, env.ContentRootPath);

            if (!string.IsNullOrEmpty(result.Error))
            {
                return Results.BadRequest(new { error = result.Error });
            }

            return Results.Ok(new { url = result.Url, finalFileName = result.FinalFileName });
        }).DisableAntiforgery();

        return group;
    }
}
