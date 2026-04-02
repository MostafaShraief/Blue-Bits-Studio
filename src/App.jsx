import { BrowserRouter, Routes, Route } from 'react-router';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ExtractionWizard from './pages/ExtractionWizard';
import CoordinationWizard from './pages/CoordinationWizard';
import PandocWizard from './pages/PandocWizard';
import DrawWizard from './pages/DrawWizard';
import History from './pages/History';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="extraction" element={<ExtractionWizard />} />
                    <Route path="coordination" element={<CoordinationWizard />} />
                    <Route path="pandoc" element={<PandocWizard />} />
                    <Route path="draw" element={<DrawWizard />} />
                    <Route path="history" element={<History />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
