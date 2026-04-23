import { BrowserRouter, Routes, Route } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { TourProvider } from './contexts/TourContext';
import Layout from './components/Layout';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import ExtractionWizard from './pages/ExtractionWizard';
import CoordinationWizard from './pages/CoordinationWizard';
import PandocWizard from './pages/PandocWizard';
import DrawWizard from './pages/DrawWizard';
import QuizHub from './pages/QuizHub';
import History from './pages/History';
import Tour from './pages/Tour';
import MergeWizard from './pages/MergeWizard';
import Login from './pages/Login';
import AdminUsers from './pages/admin/UsersManager';
import AdminMaterials from './pages/admin/MaterialsManager';
import AdminSystem from './pages/admin/SystemConfig';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <TourProvider>
                    <Routes>
                        {/* Public route */}
                        <Route path="login" element={<Login />} />

                        {/* Admin routes — require Admin role */}
                        <Route element={<AdminRoute />}>
                            <Route element={<AdminLayout />}>
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
                                <Route element={<ProtectedRoute requiredCode="LEC_EXT" />}>
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
                                <Route element={<ProtectedRoute requiredCode="QUIZ" />}>
                                    <Route path="quiz" element={<QuizHub />} />
                                </Route>
                                {/* No SystemCode — universal for all authenticated non-Admins */}
                                <Route path="history" element={<History />} />
                            </Route>
                        </Route>
                    </Routes>
                </TourProvider>
            </BrowserRouter>
        </AuthProvider>
    );
}
