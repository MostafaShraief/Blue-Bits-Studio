import { httpGet, httpPost } from './HttpClient';

const PROMPTS_BASE = '/api/prompts';

export async function getPromptForSession(sessionId, systemCode) {
  return httpGet(`${PROMPTS_BASE}/${sessionId}/${systemCode}`);
}

export async function compilePrompt(systemCode, generalNotes, fileNotes) {
  return httpPost(`${PROMPTS_BASE}/compile`, {
    systemCode,
    GeneralNotes: generalNotes,
    FileNotes: fileNotes,
  });
}
