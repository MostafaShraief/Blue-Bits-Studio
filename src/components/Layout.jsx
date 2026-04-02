import { Outlet } from 'react-router';
import Sidebar from './Sidebar';

export default function Layout() {
    return (
        <div className="flex min-h-dvh">
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                <Outlet />
            </main>

            {/* Sidebar — right side for RTL */}
            <Sidebar />
        </div>
    );
}
