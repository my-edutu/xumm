import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useUser, SignIn, SignUp, isValidCompanyEmail } from '../context/ClerkProvider';
import { ArrowLeft, Lock, Building2 } from 'lucide-react';

const AuthPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const intent = searchParams.get('intent');
    const { user, isLoaded } = useUser();

    // Determine the correct redirect path based on intent
    const getRedirectPath = () => {
        if (intent === 'admin') return '/admin/dashboard';
        return '/company/dashboard';
    };

    // Check if user is already signed in and redirect appropriately
    useEffect(() => {
        if (isLoaded && user) {
            // Always redirect authenticated users to their dashboard
            // Role-based access is handled by the protected route components
            navigate(getRedirectPath(), { replace: true });
        }
    }, [user, isLoaded, navigate, intent]);

    // If not loaded yet, show loading
    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    // If user is already signed in, redirect them (handled in useEffect above)
    // This prevents showing the auth form to already authenticated users
    if (user) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    const isAdmin = intent === 'admin';

    // Determined visual theme
    const themeColor = isAdmin ? 'orange' : 'blue';
    const themeBg = isAdmin ? 'bg-orange-600' : 'bg-blue-600';
    const themeBorder = isAdmin ? 'border-orange-500/50' : 'border-blue-500/50';
    const themeRing = isAdmin ? 'ring-orange-500/10' : 'ring-blue-500/10';
    const themeShadow = isAdmin ? 'shadow-orange-900/20' : 'shadow-blue-900/20';

    return (
        <div className="min-h-screen bg-[#020617] selection:bg-blue-500/30 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
            {/* Minimal Background with User Image */}
            <div className="absolute inset-0 -z-10 overflow-hidden opacity-40">
                <img
                    src={isAdmin ? "/assets/admin-bg.jpg" : "/assets/animated-bg.jpg"}
                    className="w-full h-full object-cover animate-[slow-zoom_30s_ease-in-out_infinite]"
                    alt=""
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/hero-bg-new.jpg";
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]"></div>
            </div>

            <div className="w-full max-w-[400px] relative z-10">
                {/* Minimal Header */}
                <div className="text-center mb-12 animate-[fadeIn_0.8s_ease-out]">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
                        <div className={`w-8 h-8 ${themeBg} rounded-lg flex items-center justify-center`}>
                            {isAdmin ? <Lock className="text-white" size={18} /> : <Building2 className="text-white" size={18} />}
                        </div>
                        <span className="text-xl font-bold tracking-tighter text-white heading-font uppercase">XUM AI</span>
                    </Link>
                    <h2 className="text-3xl font-bold text-white mb-3">
                        {isAdmin ? 'Admin Terminal' : 'Business Hub'}
                    </h2>
                    <p className="text-slate-500 text-sm font-medium">
                        {isAdmin
                            ? 'Authorized personnel only. Accessing master node.'
                            : 'Sign in to your enterprise workstation.'
                        }
                    </p>
                </div>

                {/* Minimal Clerk Auth Card */}
                <div className="animate-[fadeIn_1s_ease-out_0.2s_forwards] opacity-0" style={{ animationFillMode: 'forwards' }}>
                    <div className="bg-white/[0.02] border border-white/10 rounded-[32px] p-2 shadow-2xl overflow-hidden">
                        <SignIn
                            forceRedirectUrl={getRedirectPath()}
                            signUpForceRedirectUrl={getRedirectPath()}
                            appearance={{
                                elements: {
                                    rootBox: 'w-full',
                                    card: 'bg-transparent shadow-none p-6 md:p-8',
                                    headerTitle: 'hidden',
                                    headerSubtitle: 'hidden',
                                    socialButtonsBlockButton: 'bg-white/5 border-white/10 text-white hover:bg-white/10 h-12 rounded-xl transition-all',
                                    socialButtonsBlockButtonText: 'text-white font-semibold text-sm',
                                    dividerLine: 'bg-white/5',
                                    dividerText: 'text-slate-600 text-[10px] font-bold uppercase tracking-widest',
                                    formFieldLabel: 'text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5',
                                    formFieldInput: `bg-white/[0.03] border-white/10 text-white placeholder:text-slate-700 h-12 rounded-xl focus:${themeBorder} focus:ring-4 focus:${themeRing} transition-all text-sm`,
                                    formButtonPrimary: `${themeBg} hover:opacity-90 h-12 rounded-xl font-bold text-sm transition-all shadow-lg ${themeShadow}`,
                                    footerActionLink: `text-${themeColor}-500 hover:text-${themeColor}-400 font-bold transition-colors`,
                                    footerAction: 'text-slate-500 text-xs',
                                    identityPreviewText: 'text-white font-medium',
                                    identityPreviewEditButton: `text-${themeColor}-500`,
                                    formResendCodeLink: `text-${themeColor}-500`,
                                    otpCodeFieldInput: 'bg-white/[0.03] border-white/10 text-white rounded-xl'
                                },
                                layout: {
                                    socialButtonsPlacement: 'bottom',
                                    showOptionalFields: false
                                }
                            }}
                            routing="hash"
                        />
                    </div>
                </div>

                {/* Minimal Footer Links */}
                <div className="mt-12 flex items-center justify-between px-2 animate-[fadeIn_1s_ease-out_0.4s_forwards] opacity-0">
                    <Link to="/" className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1.5">
                        <ArrowLeft size={14} />
                        Back to Home
                    </Link>
                    <div className="flex gap-4">
                        <a href="#" className="text-xs text-slate-500 hover:text-white transition-colors">Support</a>
                        <a href="#" className="text-xs text-slate-500 hover:text-white transition-colors">Privacy</a>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slow-zoom {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                .heading-font {
                    font-family: 'Space Grotesk', sans-serif;
                }
                .text-orange-500 { color: #f97316; }
                .text-orange-400 { color: #fb923c; }
            `}</style>
        </div>
    );
};

export default AuthPage;
