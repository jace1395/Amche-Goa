import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/Logo.png';
import JacePhoto from '../../assets/jace.jpg';
import { MapPin, Trophy, FileText, Star, LogOut, Settings, CreditCard } from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();
    const [isFlipped, setIsFlipped] = useState(false);

    const [user] = useState(() => {
        const stored = localStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        if (!user) {
            navigate('/signin');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/signin');
    };

    if (!user) return null;

    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    const userReports = reports.length;
    const points = user.points || userReports * 50;

    const aadharDetails = {
        name: 'Jace Cadwy Henriques',
        aadharNo: '5772 0164 4476',
        dob: '13/04/2007',
        gender: 'Male',
        address: 'Goa, India'
    };

    return (
        <div className="p-4 pt-6 pb-28 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                        <img src={Logo} alt="Amche Goa" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                        Amche Goa
                    </h1>
                </div>
                <button onClick={handleLogout} className="glass-card p-2 text-red-400 hover:bg-red-500/20">
                    <LogOut size={18} />
                </button>
            </div>

            {/* Aadhar Card - Compact Design */}
            <div className="perspective-1000 mb-4 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                <div
                    className={`relative w-full h-48 transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* FRONT - Glassmorphism */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl border border-white/20" style={{ backfaceVisibility: 'hidden' }}>
                        {/* Heavy Blur Transparent Background */}
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-white/10"></div>

                        {/* Header Row */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <div className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center bg-white/10">
                                    <span className="text-[10px] font-bold">🦁</span>
                                </div>
                                <div className="leading-none">
                                    <p className="text-[8px] font-bold text-white">भारत सरकार</p>
                                    <p className="text-[7px] text-white/60">Govt. of India</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center">
                                    <span className="text-white text-[9px] font-bold">आ</span>
                                </div>
                                <div className="leading-none">
                                    <p className="text-[11px] font-bold text-white">आधार</p>
                                    <p className="text-[6px] text-white/50">Aadhaar</p>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="absolute top-14 left-3 right-3 bottom-12 flex gap-3">
                            {/* Photo */}
                            <div className="w-20 h-24 border-2 border-cyan-400/50 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
                                <img src={JacePhoto} alt="Photo" className="w-full h-full object-cover" />
                            </div>

                            {/* Details */}
                            <div className="flex-1 space-y-2">
                                <div>
                                    <p className="text-[10px] text-cyan-300 uppercase font-semibold tracking-wider">Name</p>
                                    <p className="text-base font-bold text-white leading-tight drop-shadow-lg">{aadharDetails.name}</p>
                                </div>
                                <div className="flex gap-6">
                                    <div>
                                        <p className="text-[10px] text-cyan-300 uppercase font-semibold tracking-wider">DOB</p>
                                        <p className="text-sm font-bold text-amber-300">{aadharDetails.dob}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-cyan-300 uppercase font-semibold tracking-wider">Gender</p>
                                        <p className="text-sm font-bold text-amber-300">{aadharDetails.gender}</p>
                                    </div>
                                </div>
                            </div>

                            {/* QR */}
                            <div className="w-16 h-16 bg-white rounded-lg p-1 flex-shrink-0 shadow-lg">
                                <div className="w-full h-full grid grid-cols-6 gap-px">
                                    {[1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1].map((v, i) => (
                                        <div key={i} className={v ? 'bg-gray-800' : 'bg-white'}></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom - Aadhar Number */}
                        <div className="absolute bottom-0 left-0 right-0 py-3 px-4 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-cyan-300 uppercase font-semibold tracking-wider">Aadhaar No.</p>
                                <p className="font-mono text-lg font-bold text-amber-300 tracking-[0.2em] drop-shadow-lg">{aadharDetails.aadharNo}</p>
                            </div>
                            <span className="text-xs text-green-400 font-bold flex items-center gap-1.5 bg-green-400/20 px-3 py-1.5 rounded-full border border-green-400/30">
                                ✓ Verified
                            </span>
                        </div>
                    </div>

                    {/* BACK */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden shadow-xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800"></div>
                        <div className="relative h-full p-4 flex flex-col">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <img src={Logo} alt="Logo" className="w-6 h-6 rounded" />
                                    <span className="text-white font-bold text-sm">AMCHE GOA</span>
                                </div>
                                <span className="text-green-400 text-[10px] font-medium bg-green-400/10 px-2 py-0.5 rounded-full">Active</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 flex-1">
                                <div className="bg-white/5 rounded-lg p-3 flex flex-col items-center justify-center">
                                    <FileText className="w-5 h-5 text-blue-400 mb-1" />
                                    <span className="text-xl font-bold text-white">{userReports}</span>
                                    <span className="text-[8px] text-white/40 uppercase">Reports</span>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3 flex flex-col items-center justify-center">
                                    <Star className="w-5 h-5 text-yellow-400 mb-1" />
                                    <span className="text-xl font-bold text-green-400">{points}</span>
                                    <span className="text-[8px] text-white/40 uppercase">Points</span>
                                </div>
                            </div>
                            <p className="text-center text-white/30 text-[9px] mt-2 flex items-center justify-center gap-1">
                                <MapPin className="w-3 h-3" /> {aadharDetails.address}
                            </p>
                        </div>
                    </div>
                </div>
                <p className="text-center text-white/20 text-[10px] mt-2 flex items-center justify-center gap-1">
                    <CreditCard className="w-3 h-3" /> Tap to flip
                </p>
            </div>

            {/* Account Info */}
            <div className="glass-card p-3 mb-3">
                <h3 className="font-semibold text-white/80 mb-2 flex items-center gap-2 text-sm">
                    <Settings className="w-4 h-4" /> Account Info
                </h3>
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-white/40">Email</span>
                        <span className="text-white/80">{user.email}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-white/40">Aadhar</span>
                        <span className="text-white/80 font-mono">{aadharDetails.aadharNo}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/40">Status</span>
                        <span className="text-green-400 font-medium">Active</span>
                    </div>
                </div>
            </div>

            {/* Badges */}
            <div className="flex-1">
                <h3 className="font-bold text-white/80 mb-3 flex items-center gap-2 text-sm">
                    <Trophy className="w-4 h-4 text-yellow-400" /> Badges
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { emoji: '🌱', label: 'Starter', unlocked: true },
                        { emoji: '🔥', label: 'Streak', unlocked: userReports >= 3 },
                        { emoji: '⭐', label: 'Top', unlocked: userReports >= 10 },
                    ].map((badge, i) => (
                        <div key={i} className={`glass-card aspect-square flex flex-col items-center justify-center p-2 ${badge.unlocked ? '' : 'opacity-40'}`}>
                            <span className="text-2xl mb-1">{badge.emoji}</span>
                            <span className="text-[8px] text-white/40 uppercase font-semibold">{badge.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Profile;
