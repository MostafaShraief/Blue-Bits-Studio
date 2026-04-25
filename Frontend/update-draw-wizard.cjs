const fs = require('fs');

let content = fs.readFileSync('src/pages/DrawWizard.jsx', 'utf8');

// Add import for useSettings
if (!content.includes('useSettings')) {
    content = content.replace(
        "import { createSession, fetchSession } from '../utils/api';",
        "import { createSession, fetchSession } from '../utils/api';\nimport { useSettings } from '../contexts/SettingsContext';"
    );
}

// Add autoSave context
if (!content.includes('const { autoSave }')) {
    content = content.replace(
        "const [searchParams] = useSearchParams();",
        "const [searchParams] = useSearchParams();\n    const { autoSave } = useSettings();"
    );
}

// Update handleSave to useCallback
if (!content.includes('const handleSave = useCallback(')) {
    content = content.replace(
        "const handleSave = async () => {",
        "const handleSave = useCallback(async () => {\n        if (saved) return;"
    );
    content = content.replace(
        "            console.error(\"Failed to save session\", e);\n        }\n    };",
        "            console.error(\"Failed to save session\", e);\n        }\n    }, [description, images, prompt, saved]);"
    );
}

// Add autoSave useEffect
if (!content.includes('if (step === 1 && autoSave')) {
    content = content.replace(
        "    return (\n        <div className=\"max-w-3xl",
        "    useEffect(() => {\n        if (step === 1 && autoSave && !saved && prompt) {\n            handleSave();\n        }\n    }, [step, autoSave, saved, prompt, handleSave]);\n\n    return (\n        <div className=\"max-w-3xl"
    );
}

// Add image gallery to step 1
const imageGallery = `
                    {/* Image gallery */}
                    {images.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-text mb-3">الصور المرفقة</h3>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {images.map((img, i) => (
                                    <div key={i} className="relative shrink-0">
                                        <img
                                            src={img.url}
                                            alt={\`صورة \${i + 1}\`}
                                            className="w-24 h-24 object-cover rounded-xl border border-border"
                                        />
                                        <span className="absolute bottom-1 right-1 bg-primary text-white text-xs font-bold rounded-md px-1.5 py-0.5">
                                            {i + 1}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
`;

if (!content.includes('الصور المرفقة')) {
    content = content.replace(
        "<PromptPreview text={prompt} />",
        imageGallery + "\n                    <PromptPreview text={prompt} />"
    );
}

fs.writeFileSync('src/pages/DrawWizard.jsx', content);
