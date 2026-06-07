import { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import TourOverlay from './TourOverlay';

export default function Layout() {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const touchStartX = useRef(null);

    useEffect(() => {
        const SWIPE_THRESHOLD = 50;
        const EDGE_THRESHOLD = 30;

        const handleTouchStart = (e) => {
            if (window.innerWidth >= 768) return;
            touchStartX.current = e.touches[0].clientX;
        };

        const handleTouchEnd = (e) => {
            if (window.innerWidth >= 768 || touchStartX.current === null) return;
            const startX = touchStartX.current;
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (startX > window.innerWidth - EDGE_THRESHOLD && diff > SWIPE_THRESHOLD) {
                setIsMobileSidebarOpen(true);
            }

            touchStartX.current = null;
        };

        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchend', handleTouchEnd);
        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    return (
        <div className="flex h-dvh overflow-hidden">
            <Sidebar
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
            />

            <main className="flex-1 overflow-y-auto">
                <div className="sticky top-0 z-30 flex items-center justify-between bg-surface px-4 py-3 border-b border-border md:hidden">
                    <button
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="p-2 -ms-2 rounded-lg hover:bg-surface-card text-text-secondary shrink-0"
                        aria-label="فتح القائمة"
                    >
                        <Menu size={24} />
                    </button>
                    <img
                        src="/logos/Horizontal logo.png"
                        alt="Blue Bits Studio"
                        className="h-8 w-auto object-contain transition-all dark:brightness-0 dark:invert shrink-0"
                    />
                </div>

                <div className="p-6 lg:p-8 md:ms-64">
                    <Outlet />
                </div>
            </main>

            <TourOverlay />
        </div>
    );
}
