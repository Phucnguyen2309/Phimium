import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/authService';

const Register = () => {
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        phone: '',
        birthdate: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await registerUser(formData);
            alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
            navigate('/login'); 
        } catch (err) {
            const errorMsg = err.message || err.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans bg-white">
            {/* Cột trái: Hình ảnh và Branding (Giống Figma) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-blue-50 border-r border-gray-100 flex-col justify-between p-12">
                <div>
                    <h1 className="text-2xl font-bold text-blue-600">Phimium</h1>
                </div>
                
                <div className="relative z-10 max-w-md">
                    <h2 className="text-5xl font-bold text-slate-900 leading-tight mb-6">
                        Discover the world with a Buddy.
                    </h2>
                    <p className="text-slate-600 mb-8 text-lg">
                        Join our community of explorers and experience local life like never before. Real connections, real adventures.
                    </p>
                    
                    <div className="space-y-4">
                        <div className="flex items-center bg-white p-4 rounded-xl shadow-sm w-max">
                            <span className="text-blue-500 mr-3">✔</span>
                            <span className="font-medium text-slate-700">Verified Safety Protocols</span>
                        </div>
                        <div className="flex items-center bg-white p-4 rounded-xl shadow-sm w-max">
                            <span className="text-blue-500 mr-3">👥</span>
                            <span className="font-medium text-slate-700">12,000+ Active Buddies</span>
                        </div>
                    </div>
                </div>

                <div className="text-sm text-slate-500">
                    © 2026 Phimium. Connecting people through real-world discovery.
                </div>
                
                {/* Lớp phủ gradient/hình nền */}
                <div className="absolute top-0 right-0 bottom-0 left-0 opacity-10 pointer-events-none bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center"></div>
            </div>

            {/* Cột phải: Form đăng ký */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24">
                <div className="max-w-md w-full mx-auto">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-slate-900">Create your account</h2>
                        <p className="text-slate-500 mt-2">Fill in your basic information to get started.</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleRegister}>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                                {error}
                            </div>
                        )}

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="fullname"
                                value={formData.fullname}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Mật khẩu >= 8 ký tự, gồm số và ký tự đặc biệt"
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        {/* Phone & Birthdate */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="0901234567"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Birth Date</label>
                                <input
                                    type="date"
                                    name="birthdate"
                                    value={formData.birthdate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-600"
                                    required
                                />
                            </div>
                        </div>

                        {/* Nút Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors mt-4 disabled:opacity-70 flex justify-center items-center"
                        >
                            {isLoading ? 'Processing...' : 'Continue ->'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;