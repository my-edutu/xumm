import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../landing/Navbar';
import Footer from '../landing/Footer';
import { Mail, User, Building2, Globe2, Sparkles, CheckCircle2, Phone, MapPin, Loader2, ChevronDown } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { countries } from '../data/countries';

const EarlyAccess: React.FC = () => {
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        country: 'United States',
        company: '',
        interest: 'Contributor (Earn from data)',
        consent: false
    });

    const activeDialCode = useMemo(() => {
        const country = countries.find(c => c.name === formData.country);
        return country ? country.dialCode : '';
    }, [formData.country]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.consent) {
            setError('Please consent to receive updates.');
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const countryWithCode = {
                ...formData,
                phone: `${activeDialCode} ${formData.phone}`.trim()
            };

            const { error: supabaseError } = await supabase
                .from('waitlist')
                .insert([countryWithCode]);

            if (supabaseError) {
                if (supabaseError.code === '23505') {
                    setError('This email is already on the waitlist.');
                } else {
                    setError('Something went wrong. Please try again.');
                }
                return;
            }

            setSubmitted(true);
        } catch (err) {
            setError('Failed to submit. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6">
                <div className="max-w-md w-full bg-white/[0.02] border border-white/10 rounded-[3rem] p-12 text-center backdrop-blur-3xl shadow-2xl relative overflow-hidden animate-in zoom-in duration-500">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 blur-[80px] rounded-full"></div>
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/40">
                            <CheckCircle2 className="text-white w-10 h-10" />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-4 outfit tracking-tighter">Application Received!</h1>
                        <p className="text-slate-400 mb-10 leading-relaxed font-medium">
                            Thank you, <span className="text-white">{formData.full_name.split(' ')[0]}</span>. We've added you to the waitlist. Our team will reach out to you via email soon.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-95 shadow-xl"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col selection:bg-blue-500/30">
            <Navbar />

            <main className="flex-1 pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 -z-10"></div>

                <div className="container max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full mb-8">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Waitlist v2.0 Live</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-[0.85] outfit tracking-tighter">
                            Secure your spot in the <span className="text-blue-500">Network.</span>
                        </h1>
                        <p className="text-xl text-slate-400 leading-relaxed mb-12 max-w-lg">
                            We are carefully onboarding the next wave of data creators and enterprise partners. Access is granted on a rolling basis.
                        </p>

                        <div className="flex flex-wrap gap-10">
                            <div className="flex items-center gap-4">
                                <div className="text-3xl font-black text-white outfit">50K+</div>
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-tight">Active<br />Nodes</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-3xl font-black text-white outfit">99%</div>
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-tight">Logic<br />Accuracy</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000">
                        <div className="bg-white/[0.02] border border-white/10 p-8 md:p-12 rounded-[3.5rem] backdrop-blur-3xl relative shadow-3xl">
                            {error && (
                                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-widest text-center animate-in shake duration-500">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Interested In</label>
                                    <div className="relative group">
                                        <select
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm appearance-none cursor-pointer"
                                            value={formData.interest}
                                            onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                                        >
                                            <option>Contributor (Earn from data)</option>
                                            <option>Enterprise (Buy datasets/API)</option>
                                            <option>Developer (Build on XUM)</option>
                                            <option>Researcher (Academic datasets)</option>
                                        </select>
                                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Your identity"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            required
                                            type="email"
                                            placeholder="name@domain.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Country</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                        <select
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-12 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm appearance-none cursor-pointer"
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        >
                                            {countries.map((c) => (
                                                <option key={c.code} value={c.name} className="bg-[#020617]">{c.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Phone Number</label>
                                    <div className="relative group flex">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                            <span className="text-sm font-black text-blue-500 mt-0.5">{activeDialCode}</span>
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="000 000 0000"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pr-6 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm"
                                            style={{ paddingLeft: `${activeDialCode.length * 9 + 60}px` }}
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Organization (Optional)</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Company Name"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm"
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 px-2">
                                    <input
                                        type="checkbox"
                                        id="consent"
                                        required
                                        className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500"
                                        checked={formData.consent}
                                        onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                                    />
                                    <label htmlFor="consent" className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest cursor-pointer hover:text-slate-300 transition-colors">
                                        I consent to receive network updates and protocol activations.
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-6 bg-blue-600 text-white font-black uppercase tracking-widest rounded-[2rem] hover:bg-blue-500 transition-all active:scale-95 shadow-2xl shadow-blue-900/40 flex items-center justify-center gap-3 group"
                                >
                                    {loading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            Submit
                                            <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default EarlyAccess;
