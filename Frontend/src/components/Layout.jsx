import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import TourOverlay from './TourOverlay';

export default function Layout() {
    return (
        <div className="flex h-dvh overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 lg:p-8 md:ms-64">
                <Outlet />
            </main>
            
            <TourOverlay />
        </div>
    );
}
