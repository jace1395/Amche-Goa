import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Camera, Gift, User, Clock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const BottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/history', label: 'History', icon: Clock },
        { path: '/report', label: 'Report', icon: Camera, isMain: true },
        { path: '/rewards', label: 'Rewards', icon: Gift },
        { path: '/profile', label: 'Profile', icon: User },
    ];

    // Navigate or reset if clicking on current page
    const handleNavigation = (path, e) => {
        e.preventDefault();
        if (location.pathname === path) {
            // If already on this page, dispatch reset event (for Report page)
            if (path === '/report') {
                window.dispatchEvent(new CustomEvent('resetReport'));
            }
        } else {
            navigate(path);
        }
    };

    return (
        <>
            {/* Curved Background with more transparency */}
            <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
                <svg viewBox="0 0 400 80" className="w-full h-20" preserveAspectRatio="none">
                    <path
                        d="M0,80 L0,30 Q0,0 30,0 L155,0 Q175,0 180,20 Q200,60 220,20 Q225,0 245,0 L370,0 Q400,0 400,30 L400,80 Z"
                        className="fill-white/5"
                    />
                </svg>
                {/* Glass blur overlay */}
                <div className="absolute inset-0 backdrop-blur-2xl bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>

            {/* Navigation Items */}
            <nav className="fixed bottom-0 left-0 right-0 h-20 z-50">
                <div className="flex items-end justify-around px-2 w-full h-full pb-3">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        if (item.isMain) {
                            return (
                                <div key={item.path} className="relative -top-6 flex flex-col items-center">
                                    <button
                                        onClick={(e) => handleNavigation(item.path, e)}
                                        className={twMerge(
                                            "flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 active:scale-95",
                                            "bg-gradient-to-br from-green-400 to-green-600 text-white",
                                            "shadow-[0_0_30px_rgba(34,197,94,0.6)] border-4 border-slate-900/50"
                                        )}
                                    >
                                        <Icon size={28} strokeWidth={2.5} />
                                    </button>
                                    <span className="text-[10px] font-semibold text-white/70 mt-2">
                                        {item.label}
                                    </span>
                                </div>
                            );
                        }

                        return (
                            <button
                                key={item.path}
                                onClick={(e) => handleNavigation(item.path, e)}
                                className={twMerge(
                                    "flex flex-col items-center justify-center px-3 py-1 transition-colors duration-200",
                                    isActive ? "text-green-400" : "text-white/40 hover:text-white/70"
                                )}
                            >
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </>
    );
};

export default BottomNav;
