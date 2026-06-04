import { useState } from 'react';
import { Outlet } from 'react-router';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import TourOverlay from './TourOverlay';

export default function Layout() {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <div className="flex h-dvh overflow-hidden">
            <Sidebar
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
            />

            <main className="flex-1 overflow-y-auto">
                <div className="sticky top-0 z-30 flex items-center gap-3 bg-surface p-4 border-b border-border md:hidden">
                    <button
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="p-2 -ms-2 rounded-lg hover:bg-surface-card text-text-secondary"
                        aria-label="فتح القائمة"
                    >
                        <Menu size={24} />
                    </button>
                </div>

                <div className="p-6 lg:p-8 md:ms-64">
                    <Outlet />
                </div>
            </main>

            <TourOverlay />
        </div>
    );
}
