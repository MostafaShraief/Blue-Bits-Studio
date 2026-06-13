export const EXTERNAL_LINKS = {
  AI_STUDIO: 'https://aistudio.google.com/prompts/new_chat',
};

export const INTERNAL_ROUTES = {
  EXTRACTION: '/extraction',
  COORDINATION: '/coordination',
  PANDOC: '/pandoc',
  MERGE: '/merge',
  DRAW: '/draw',
  QUIZ: '/quiz',
  HISTORY: '/history',
  TOUR: '/tour',
  LOGIN: '/login',
  UNAUTHORIZED: '/unauthorized',
  DASHBOARD: '/',
  ADMIN_UNAUTHORIZED: '/403',
  ADMIN_USERS: '/admin/users',
  ADMIN_MATERIALS: '/admin/materials',
  ADMIN_SYSTEM: '/admin/system',
};

export function getSessionRoute(session) {
  const { workflowType, id } = session;
  const routes = {
    LEC_EXT: `${INTERNAL_ROUTES.EXTRACTION}?type=lecture&id=${id}`,
    BANK_EXT: `${INTERNAL_ROUTES.EXTRACTION}?type=bank&id=${id}`,
    LEC_COORD: `${INTERNAL_ROUTES.COORDINATION}?type=lecture&id=${id}`,
    BANK_COORD: `${INTERNAL_ROUTES.COORDINATION}?type=bank&id=${id}`,
    BANK_QS: `${INTERNAL_ROUTES.QUIZ}?id=${id}`,
    DRAW: `${INTERNAL_ROUTES.DRAW}?id=${id}`,
    MERGE: `${INTERNAL_ROUTES.MERGE}?id=${id}`,
  };
  return routes[workflowType] || INTERNAL_ROUTES.DASHBOARD;
}
