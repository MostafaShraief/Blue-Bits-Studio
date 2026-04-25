import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { TourProvider } from './contexts/TourContext';
import Layout from './components/Layout';
import AdminRoute from './components/AdminRoute';
import AuthOnlyRoute from './components/AuthOnlyRoute';
import ProtectedRoute from './components/ProtectedRoute';
import PageLoader from './components/PageLoader';

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
        <AuthProvider>
            <BrowserRouter>
                <TourProvider>
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                        {/* Public route */}
                        <Route path="login" element={<Login />} />
                        <Route path="403" element={<AdminUnauthorized />} />

                        {/* Admin routes — require Admin role */}
                        <Route element={<AdminRoute />}>
                            <Route element={<Layout />}>
                                <Route path="admin/users" element={<AdminUsers />} />
                                <Route path="admin/materials" element={<AdminMaterials />} />
                                <Route path="admin/system" element={<AdminSystem />} />
                            </Route>
                        </Route>

                        {/* Protected routes — require authentication */}
                        <Route element={<ProtectedRoute />}>
                            <Route element={<Layout />}>
                                <Route index element={<Dashboard />} />
                                <Route path="tour" element={<Tour />} />

                                {/* Workflow routes — require specific SystemCode access */}
                                {/* Extraction is handled by ExtractionWizard double-gate logic */}
                                <Route element={<ProtectedRoute />}>
                                    <Route path="extraction" element={<ExtractionWizard />} />
                                </Route>
                                <Route element={<ProtectedRoute requiredCode="COORD" />}>
                                    <Route path="coordination" element={<CoordinationWizard />} />
                                </Route>
                                <Route element={<ProtectedRoute requiredCode="PANDOC" />}>
                                    <Route path="pandoc" element={<PandocWizard />} />
                                </Route>
                                <Route element={<ProtectedRoute requiredCode="DRAW" />}>
                                    <Route path="draw" element={<DrawWizard />} />
                                </Route>
                                <Route element={<ProtectedRoute requiredCode="MERGE" />}>
                                    <Route path="merge" element={<MergeWizard />} />
                                </Route>
                                <Route element={<ProtectedRoute requiredCode="BANK_QS" />}>
                                    <Route path="quiz" element={<QuizHub />} />
                                </Route>
                                {/* No SystemCode — universal for all authenticated non-Admins */}
                                <Route path="history" element={<History />} />
                            </Route>
                        </Route>

                        {/* Catch-all for any unmatched route - shows 404 with Layout sidebar for authenticated users */}
                        <Route element={<AuthOnlyRoute />}>
                            <Route element={<Layout />}>
                                <Route path="*" element={<NotFound />} />
                            </Route>
                        </Route>

                        {/* Catch-all for unauthenticated users - redirect to login */}
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                    </Suspense>
                </TourProvider>
            </BrowserRouter>
        </AuthProvider>
    );
}
