/* ── Prompt Template Loader ───────────────────────
 *  Imports all prompt markdown files from Resources/Prompts
 *  as raw strings using Vite's ?raw query.
 */

import lectureExtractionRaw from '../../Resources/Prompts/استخراج النص من المحاضرة.md?raw';
import bankExtractionRaw from '../../Resources/Prompts/استخراج أسئلة البنك.md?raw';
import drawingRaw from '../../Resources/Prompts/الرسم بالذكاء الاصطناعي.md?raw';
import lectureCoordinationRaw from '../../Resources/Prompts/تنسيق المحاضرات.md?raw';
import bankCoordinationRaw from '../../Resources/Prompts/تنسيق البنوك.md?raw';
import mcqGenerationRaw from '../../Resources/Prompts/بناء بنك أسئلة.md?raw';

export const PROMPTS = {
    lectureExtraction: lectureExtractionRaw,
    bankExtraction: bankExtractionRaw,
    drawing: drawingRaw,
    lectureCoordination: lectureCoordinationRaw,
    bankCoordination: bankCoordinationRaw,
    mcqGeneration: mcqGenerationRaw,
};

/**
 * Build the final extraction prompt given user inputs.
 *
 * @param {'lecture'|'bank'} workflowType
 * @param {{ materialName: string, lectureNumber: string, lectureType: string }} naming
 * @param {{ url: string, note: string }[]} images - each with objectURL and note
 * @param {string} generalNotes
 * @returns {string} assembled prompt text
 */
export function buildExtractionPrompt(workflowType, naming, images, generalNotes) {
    const base =
        workflowType === 'lecture'
            ? PROMPTS.lectureExtraction
            : PROMPTS.bankExtraction;

    const parts = [base.trim()];

    // Image notes
    if (images && images.length > 0) {
        const imageNoteLines = images
            .map((img, index) => {
                const ext = img.file && img.file.name.includes('.') ? img.file.name.split('.').pop() : 'jpg';
                const fileName = `image-${index + 1}.${ext}`;
                return img.note ? `[Image: ${fileName}] Note: ${img.note}` : null;
            })
            .filter(Boolean);

        if (imageNoteLines.length > 0) {
            parts.push(`### ملاحظات الصور:\n${imageNoteLines.join('\n')}`);
        }
    }

    // General notes
    if (generalNotes && generalNotes.trim()) {
        parts.push(`### ملاحظات عامة:\n\n${generalNotes.trim()}`);
    }

    return parts.join('\n\n');
}

/**
 * Build coordination prompt.
 */
export function buildCoordinationPrompt(workflowType, markdownText) {
    const base =
        workflowType === 'lecture'
            ? PROMPTS.lectureCoordination
            : PROMPTS.bankCoordination;

    return `${base.trim()}\n\n${markdownText.trim()}`;
}

/**
 * Build drawing prompt.
 */
export function buildDrawingPrompt(description, images = []) {
    const parts = [PROMPTS.drawing.trim()];

    if (images && images.length > 0) {
        const imageNoteLines = images
            .map((img, index) => {
                const ext = img.file && img.file.name.includes('.') ? img.file.name.split('.').pop() : 'jpg';
                const fileName = `image-${index + 1}.${ext}`;
                return img.note ? `[Image: ${fileName}] Note: ${img.note}` : null;
            })
            .filter(Boolean);

        if (imageNoteLines.length > 0) {
            parts.push(`### ملاحظات الصور:\n${imageNoteLines.join('\n')}`);
        }
    }

    if (description && description.trim()) {
        parts.push(`### ملاحظات عامة:\n\n${description.trim()}`);
    }

    return parts.join('\n\n');
}
