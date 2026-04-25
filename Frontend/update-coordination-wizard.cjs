const fs = require('fs');

let content = fs.readFileSync('src/pages/CoordinationWizard.jsx', 'utf8');

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
        "            console.error(\"Failed to save session\", e);\n        }\n    }, [workflowType, prompt, markdownText, saved]);"
    );
}

// Add autoSave useEffect
if (!content.includes('if (step === 1 && autoSave')) {
    content = content.replace(
        "    return (\n        <div className=\"max-w-3xl",
        "    useEffect(() => {\n        if (step === 1 && autoSave && !saved && prompt) {\n            handleSave();\n        }\n    }, [step, autoSave, saved, prompt, handleSave]);\n\n    return (\n        <div className=\"max-w-3xl"
    );
}

fs.writeFileSync('src/pages/CoordinationWizard.jsx', content);
