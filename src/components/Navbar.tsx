import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { Button } from './UI';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const links = [
        { name: 'Home', path: '/' },
        { name: 'Analyze', path: '/analyze' },
        { name: 'About', path: '/about' },
    ];

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo Section - NO BLUE BG */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <img
                            src="/logo.png"
                            alt="BoneGuard Logo"
                            className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-slate-200 group-hover:shadow-blue-200 transition-all duration-300 bg-transparent"
                        />
                        <div className="flex flex-col -space-y-1">
                            <span className="font-bold text-lg tracking-tight text-slate-900">
                                BoneGuard
                            </span>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                AI
                            </span>
                        </div>
                    </Link>


                    {/* Navigation Pill */}
                    <div className="hidden md:flex items-center p-1.5 bg-slate-100/80 backdrop-blur-sm border border-slate-200/50 rounded-full shadow-inner">
                        {links.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={clsx(
                                        "px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300",
                                        isActive
                                            ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50"
                                            : "text-slate-500 hover:text-slate-900"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center">
                        <Button
                            onClick={() => navigate('/premium')}
                            className="px-6 py-2.5 rounded-full text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all duration-300 active:scale-95"
                        >
                            Upgrade to Premium
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
