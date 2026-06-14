import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { TourProvider } from './contexts/TourContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout';
import AdminRoute from './components/AdminRoute';
import AuthOnlyRoute from './components/AuthOnlyRoute';
import ProtectedRoute from './components/ProtectedRoute';
import PageLoader from './components/PageLoader';
import Toast from './components/Toast';
import { INTERNAL_ROUTES } from './config/links';

// Lazy load all page components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ExtractionWizard = lazy(() => import('./pages/ExtractionWizard'));
const CoordinationWizard = lazy(() => import('./pages/CoordinationWizard'));
const PandocWizard = lazy(() => import('./pages/PandocWizard'));
const DrawWizard = lazy(() => import('./pages/DrawWizard'));
const QuizHub = lazy(() => import('./pages/QuizHub'));
const History = lazy(() => import('./pages/History'));
const Tour = lazy(() => import('./pages/Tour'));
const MergeWizard = lazy(() => import('./pages/MergeWizard'));
const Login = lazy(() => import('./pages/Login'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminUnauthorized = lazy(() => import('./pages/Admin-Unauthorized'));
const AdminUsers = lazy(() => import('./pages/admin/UsersManager'));
const AdminMaterials = lazy(() => import('./pages/admin/MaterialsManager'));
const AdminSystem = lazy(() => import('./pages/admin/SystemConfig'));

export default function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <BrowserRouter>
                    <TourProvider>
                        <Suspense fallback={<PageLoader />}>
                            <Routes>
                        <Route path={INTERNAL_ROUTES.LOGIN.replace('/', '')} element={<Login />} />
                        <Route path={INTERNAL_ROUTES.ADMIN_UNAUTHORIZED.replace('/', '')} element={<AdminUnauthorized />} />

                        <Route element={<ProtectedRoute />}>
                            <Route element={<Layout />}>
                                <Route index element={<Dashboard />} />
                                <Route path={INTERNAL_ROUTES.TOUR.replace('/', '')} element={<Tour />} />
                                <Route path={INTERNAL_ROUTES.UNAUTHORIZED.replace('/', '')} element={<Unauthorized />} />

                                <Route element={<ProtectedRoute />}>
                                    <Route path={INTERNAL_ROUTES.EXTRACTION.replace('/', '')} element={<ExtractionWizard />} />
                                </Route>
                                <Route element={<ProtectedRoute />}>
                                    <Route path={INTERNAL_ROUTES.COORDINATION.replace('/', '')} element={<CoordinationWizard />} />
                                </Route>
                                <Route element={<ProtectedRoute />}>
                                    <Route path={INTERNAL_ROUTES.PANDOC.replace('/', '')} element={<PandocWizard />} />
                                </Route>
                                <Route element={<ProtectedRoute requiredCode="DRAW" />}>
                                    <Route path={INTERNAL_ROUTES.DRAW.replace('/', '')} element={<DrawWizard />} />
                                </Route>
                                <Route element={<ProtectedRoute requiredCode="MERGE" />}>
                                    <Route path={INTERNAL_ROUTES.MERGE.replace('/', '')} element={<MergeWizard />} />
                                </Route>
                                <Route element={<ProtectedRoute requiredCode="BANK_QS" />}>
                                    <Route path={INTERNAL_ROUTES.QUIZ.replace('/', '')} element={<QuizHub />} />
                                </Route>
                                <Route path={INTERNAL_ROUTES.HISTORY.replace('/', '')} element={<History />} />
                            </Route>
                        </Route>

                        <Route element={<AuthOnlyRoute />}>
                            <Route element={<Layout />}>
                                <Route path="*" element={<NotFound />} />
                            </Route>
                        </Route>

                        <Route element={<AdminRoute />}>
                            <Route element={<Layout />}>
                                <Route path={INTERNAL_ROUTES.ADMIN_USERS.replace('/', '')} element={<AdminUsers />} />
                                <Route path={INTERNAL_ROUTES.ADMIN_MATERIALS.replace('/', '')} element={<AdminMaterials />} />
                                <Route path={INTERNAL_ROUTES.ADMIN_SYSTEM.replace('/', '')} element={<AdminSystem />} />
                            </Route>
                        </Route>

                        <Route path="*" element={<Navigate to={INTERNAL_ROUTES.LOGIN} replace />} />
                    </Routes>
                        </Suspense>
                    </TourProvider>
                    <Toast />
                </BrowserRouter>
            </AuthProvider>
        </ToastProvider>
    );
}
