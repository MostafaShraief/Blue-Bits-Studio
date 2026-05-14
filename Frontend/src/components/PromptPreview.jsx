/**
 * Renders the assembled prompt with per-line dir="auto" for dynamic RTL/LTR.
 *
 * @param {{ text: string }} props
 */
export default function PromptPreview({ text }) {
    if (!text) return null;

    const lines = text.split('\n');

    return (
        <div className="bg-surface-card border border-border rounded-2xl p-5 max-h-[500px] overflow-y-auto space-y-0.5 text-sm leading-relaxed font-mono">
            {lines.map((line, i) => (
                <p key={i} dir="auto" className="whitespace-pre-wrap break-words min-h-[1.25em]">
                    {line || '\u00A0'}
                </p>
            ))}
        </div>
    );
}
