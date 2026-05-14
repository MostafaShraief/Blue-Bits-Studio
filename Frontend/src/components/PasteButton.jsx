import { ClipboardPaste } from 'lucide-react';

export default function PasteButton({ onPaste }) {
    const handlePaste = async () => {
        try {
            if (!navigator.clipboard || !navigator.clipboard.readText) {
                throw new Error("Clipboard API not supported");
            }
            const text = await navigator.clipboard.readText();
            if (text) onPaste(text);
        } catch (e) {
            console.error("Paste failed", e);
            alert("فشل اللصق. يرجى التأكد من السماح للمتصفح بالوصول للحافظة (Clipboard) أو استخدم اختصار Ctrl+V.");
        }
    };

    return (
        <button
            type="button"
            onClick={handlePaste}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-secondary hover:bg-surface-hover hover:text-primary transition-default bg-surface"
            title="لصق من الحافظة"
        >
            <ClipboardPaste size={14} />
            لصق
        </button>
    );
}
