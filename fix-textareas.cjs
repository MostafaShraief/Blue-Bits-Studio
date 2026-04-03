const fs = require('fs');

const files = [
    'src/pages/ExtractionWizard.jsx',
    'src/pages/PandocWizard.jsx',
    'src/pages/DrawWizard.jsx',
    'src/pages/CoordinationWizard.jsx'
];

const replacement = `onPaste={(e) => {
                                const items = e.clipboardData?.items;
                                if (!items) return;
                                let hasImage = false;
                                for (let i = 0; i < items.length; i++) {
                                    if (items[i].type.indexOf('image') !== -1) {
                                        hasImage = true;
                                        const file = items[i].getAsFile();
                                        if (file) {
                                            const url = URL.createObjectURL(file);
                                            setImages((prev) => [...prev, { file, url, note: '' }]);
                                        }
                                    }
                                }
                                if (hasImage) e.preventDefault();
                            }}`;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Find <textarea and add onPaste
    // Wait, the regex might be tricky. Let's just find `<textarea` and replace it with `<textarea\n                            ${replacement}`
    // But maybe it already has onPaste? Let's check first.
    if (!content.includes('hasImage = true;')) {
        content = content.replace(/<textarea/g, `<textarea\n                            ${replacement}`);
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
});
