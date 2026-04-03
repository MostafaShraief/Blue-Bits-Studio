import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';

/**
 * Image upload card with per-image note textarea.
 *
 * @param {{ images: Array, onAdd: (file:File)=>void, onRemove: (index:number)=>void, onNoteChange: (index:number, text:string)=>void }} props
 */
export default function ImageUploader({ images, onAdd, onRemove, onNoteChange, maxImages = Infinity }) {
    const inputRef = useRef(null);

    const handleFiles = (fileList) => {
        let count = images.length;
        Array.from(fileList).forEach((file) => {
            if (file.type.startsWith('image/') && count < maxImages) {
                onAdd(file);
                count++;
            }
        });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    };

    return (
        <div className="space-y-4">
            {/* Existing images */}
            {images.map((img, i) => (
                <div
                    key={i}
                    className="flex gap-4 bg-surface-card border border-border rounded-2xl p-4 animate-fade-slide-in"
                >
                    {/* Thumbnail */}
                    <div className="relative shrink-0">
                        <img
                            src={img.url}
                            alt={`صورة ${i + 1}`}
                            className="w-28 h-28 object-cover rounded-xl border border-border"
                        />
                        <button
                            onClick={() => onRemove(i)}
                            className="absolute -top-2 -left-2 bg-danger text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:scale-110 transition-default"
                        >
                            <X size={14} />
                        </button>
                        <span className="absolute bottom-1 right-1 bg-primary text-white text-xs font-bold rounded-md px-1.5 py-0.5">
                            {i + 1}
                        </span>
                    </div>

                    {/* Note textarea */}
                    <textarea
                        value={img.note}
                        onChange={(e) => onNoteChange(i, e.target.value)}
                        placeholder={`ملاحظات الصورة ${i + 1}... (اختياري)`}
                        rows={3}
                        className="flex-1 resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-default"
                    />
                </div>
            ))}

            {/* Add button / drop zone */}
            {images.length < maxImages && (
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => inputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-primary/30 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary-light/30 transition-default"
                >
                    <ImagePlus size={32} className="text-primary" strokeWidth={1.5} />
                    <p className="text-sm text-text-secondary">اضغط أو اسحب الصور هنا</p>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                            handleFiles(e.target.files);
                            e.target.value = '';
                        }}
                    />
                </div>
            )}
        </div>
    );
}
