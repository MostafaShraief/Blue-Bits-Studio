const fs = require('fs');

function processFile(path, stepsLength) {
    let content = fs.readFileSync(path, 'utf-8');

    // Fix images in useEffect
    content = content.replace(/note: img\.note \|\| ''/g, "note: data.notes?.find(n => n.noteType === `Image-${img.orderIndex}`)?.noteText || ''");
    
    // Add setSaved(true) and setStep
    if (content.includes("setImages(loadedImages);") && !content.includes("setSaved(true);")) {
        content = content.replace("setImages(loadedImages);", "setImages(loadedImages);\n                    }\n                    setSaved(true);\n                    setStep(STEPS.length - 1);");
    } else if (content.includes("if (data.prompt && data.prompt.promptText) setMdText(data.prompt.promptText);") && !content.includes("setSaved(true);")) { // Pandoc
        content = content.replace("if (data.prompt && data.prompt.promptText) setMdText(data.prompt.promptText);", "if (data.prompt && data.prompt.promptText) setMdText(data.prompt.promptText);\n                    setSaved(true);\n                    setStep(STEPS.length - 1);");
    }
    
    // Fix missing images in createSession
    if (content.includes("imageNotes: images.map((img) => ({ note: img.note })),") && !content.includes("images: images")) {
        content = content.replace("imageNotes: images.map((img) => ({ note: img.note })),", "images,\n                imageNotes: images.map((img) => ({ note: img.note })),");
    }
    
    fs.writeFileSync(path, content, 'utf-8');
}

processFile('src/pages/ExtractionWizard.jsx');
processFile('src/pages/CoordinationWizard.jsx');
processFile('src/pages/DrawWizard.jsx');
processFile('src/pages/PandocWizard.jsx');
