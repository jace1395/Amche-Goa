import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, MapPin, Eye, EyeOff, UserPlus } from 'lucide-react';

const SignUp = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        location: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        // Get existing users
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        // Check if email exists
        if (users.find(u => u.email === formData.email)) {
            setError('Email already registered');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            name: formData.name,
            email: formData.email,
            location: formData.location,
            password: formData.password,
            points: 0,
            reportsCount: 0,
            createdAt: new Date().toISOString()
        };

        // Save user
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(newUser));

        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 py-10">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent mb-2">
                        Join Amche Goa
                    </h1>
                    <p className="text-white/50">Create your account to start reporting</p>
                </div>

                {/* Glass Card Form */}
                <div className="glass-card-elevated p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        {/* Name Field */}
                        <div>
                            <label className="block text-white/60 text-sm font-medium mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-white/60 text-sm font-medium mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                                />
                            </div>
                        </div>

                        {/* Location Field */}
                        <div>
                            <label className="block text-white/60 text-sm font-medium mb-2">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g., Panaji, Goa"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-white/60 text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-white/60 text-sm font-medium mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            <UserPlus size={20} />
                            Create Account
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-1 border-t border-white/10"></div>
                        <span className="px-4 text-white/30 text-sm">or</span>
                        <div className="flex-1 border-t border-white/10"></div>
                    </div>

                    {/* Sign In Link */}
                    <p className="text-center text-white/50">
                        Already have an account?{' '}
                        <Link to="/signin" className="text-green-400 hover:text-green-300 font-medium">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
