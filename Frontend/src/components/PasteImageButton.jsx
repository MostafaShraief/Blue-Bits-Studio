import { ClipboardPaste } from 'lucide-react';

export default function PasteImageButton({ onPasteImage }) {
    const handlePaste = async () => {
        try {
            if (!navigator.clipboard || !navigator.clipboard.read) {
                throw new Error("Clipboard read API not supported");
            }
            const clipboardItems = await navigator.clipboard.read();
            let foundImage = false;
            for (const clipboardItem of clipboardItems) {
                const imageTypes = clipboardItem.types.filter(type => type.startsWith('image/'));
                for (const imageType of imageTypes) {
                    const blob = await clipboardItem.getType(imageType);
                    const file = new File([blob], `pasted-image-${Date.now()}.${imageType.split('/')[1] || 'png'}`, { type: imageType });
                    onPasteImage(file);
                    foundImage = true;
                }
            }
            if (!foundImage) {
                alert("لم يتم العثور على صورة في الحافظة.");
            }
        } catch (e) {
            console.error("Paste image failed", e);
            alert("فشل اللصق. يرجى التأكد من السماح للمتصفح بالوصول للحافظة (Clipboard) أو استخدم اختصار Ctrl+V.");
        }
    };

    return (
        <button
            type="button"
            onClick={handlePaste}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-secondary hover:bg-surface-hover hover:text-primary transition-default bg-surface"
            title="لصق صورة من الحافظة"
        >
            <ClipboardPaste size={14} />
            لصق صورة
        </button>
    );
}
