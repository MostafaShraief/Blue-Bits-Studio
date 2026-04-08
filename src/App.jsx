import { BrowserRouter, Routes, Route } from 'react-router';
import { TourProvider } from './contexts/TourContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ExtractionWizard from './pages/ExtractionWizard';
import CoordinationWizard from './pages/CoordinationWizard';
import PandocWizard from './pages/PandocWizard';
import DrawWizard from './pages/DrawWizard';
import QuizHub from './pages/QuizHub';
import History from './pages/History';
import Tour from './pages/Tour';
import MergeWizard from './pages/MergeWizard';

export default function App() {
    return (
        <BrowserRouter>
            <TourProvider>
                <Routes>
                    <Route element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="tour" element={<Tour />} />
                        <Route path="extraction" element={<ExtractionWizard />} />
                        <Route path="coordination" element={<CoordinationWizard />} />
                        <Route path="pandoc" element={<PandocWizard />} />
                        <Route path="draw" element={<DrawWizard />} />
                        <Route path="merge" element={<MergeWizard />} />
                        <Route path="quiz" element={<QuizHub />} />
                        <Route path="history" element={<History />} />
                    </Route>
                </Routes>
            </TourProvider>
        </BrowserRouter>
    );
}
