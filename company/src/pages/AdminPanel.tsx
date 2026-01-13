import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser, SignIn, useClerk } from '../context/ClerkProvider';
import { supabase } from '../supabaseClient';
import {
    LayoutDashboard,
    Users,
    ClipboardList,
    Wallet,
    Settings,
    LogOut,
    ShieldAlert,
    ArrowLeft,
    Lock,
    Plus,
    X,
    ShieldCheck,
    CheckCircle2,
    Search,
    UserPlus,
    Zap,
    Activity,
    Trash2
} from 'lucide-react';

// Hardcoded Master Admin
const MASTER_ADMIN = 'info@xumai.app';

const AdminPanel: React.FC = () => {
    const navigate = useNavigate();
    const { signOut } = useClerk();
    const { user, isLoaded } = useUser();
    const [activeView, setActiveView] = useState('overview');
    const [admins, setAdmins] = useState<any[]>([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);

    // User Management State
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [isAddingAdmin, setIsAddingAdmin] = useState(false);

    const userEmail = user?.primaryEmailAddress?.emailAddress || '';

    // Check if current user is an admin in DB
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        if (isLoaded && user) {
            checkAuth();
            fetchAdmins();
        }
    }, [isLoaded, user]);

    const checkAuth = async () => {
        if (userEmail === MASTER_ADMIN) {
            setIsAuthorized(true);
            return;
        }

        const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('email', userEmail)
            .eq('role', 'admin')
            .maybeSingle();

        setIsAuthorized(!!data);
    };

    const fetchAdmins = async () => {
        setLoadingAdmins(true);
        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'admin');

        // Add Master Admin as virtual if not in DB
        const list = data || [];
        if (!list.find(a => a.email === MASTER_ADMIN)) {
            list.unshift({ email: MASTER_ADMIN, full_name: 'Master Admin', id: 'master' });
        }
        setAdmins(list);
        setLoadingAdmins(false);
    };

    const handleAddAdmin = async () => {
        if (!newAdminEmail) return;

        const { error } = await supabase
            .from('users')
            .upsert({
                email: newAdminEmail,
                role: 'admin',
                full_name: 'Pending Invite'
            }, { onConflict: 'email' });

        if (error) {
            alert("Error adding admin: " + error.message);
        } else {
            setNewAdminEmail('');
            setIsAddingAdmin(false);
            fetchAdmins();
        }
    };

    const handleRemoveAdmin = async (email: string) => {
        if (email === MASTER_ADMIN) return;
        if (!confirm(`Remove admin rights for ${email}?`)) return;

        const { error } = await supabase
            .from('users')
            .update({ role: 'company' })
            .eq('email', email);

        if (error) alert(error.message);
        else fetchAdmins();
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    // Waitlist State
    const [waitlist, setWaitlist] = useState<any[]>([]);
    const [loadingWaitlist, setLoadingWaitlist] = useState(false);

    useEffect(() => {
        if (activeView === 'waitlist') {
            fetchWaitlist();
        }
    }, [activeView]);

    const fetchWaitlist = async () => {
        setLoadingWaitlist(true);
        const { data, error } = await supabase
            .from('waitlist')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) setWaitlist(data || []);
        setLoadingWaitlist(false);
    };

    const handleUpdateWaitlistStatus = async (id: string, status: string) => {
        const { error } = await supabase
            .from('waitlist')
            .update({ status })
            .eq('id', id);

        if (!error) fetchWaitlist();
    };

    const handleDeleteWaitlist = async (id: string) => {
        if (!confirm('Delete this entry?')) return;
        const { error } = await supabase
            .from('waitlist')
            .delete()
            .eq('id', id);

        if (!error) fetchWaitlist();
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="text-center mb-12">
                        <div className="w-20 h-20 bg-orange-600/10 border border-orange-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <ShieldAlert className="text-orange-500" size={40} />
                        </div>
                        <h1 className="text-4xl font-black text-white outfit tracking-tighter mb-2">XUM <span className="text-orange-500">Admin</span></h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Restricted Internal Access</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-2 overflow-hidden shadow-2xl">
                        <SignIn routing="hash" />
                    </div>
                    <Link to="/" className="mt-8 flex justify-center items-center gap-2 text-slate-500 hover:text-white transition-all font-bold text-xs uppercase tracking-widest">
                        <ArrowLeft size={16} /> Return to Portal
                    </Link>
                </div>
            </div>
        );
    }

    if (isAuthorized === false) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                        <Lock className="text-red-500" size={48} />
                    </div>
                    <h1 className="text-3xl font-black text-white outfit mb-4">Access Restricted</h1>
                    <p className="text-slate-400 mb-10 leading-relaxed font-medium">
                        Your account <span className="text-white font-bold">{userEmail}</span> does not have Administrative clearance. Please contact the Master Admin.
                    </p>
                    <div className="flex flex-col gap-4">
                        <button onClick={handleLogout} className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black outfit text-lg hover:bg-orange-500 transition-all shadow-2xl shadow-orange-950/40">
                            Switch Account
                        </button>
                        <button onClick={() => navigate('/')} className="w-full py-5 bg-white/5 text-white rounded-2xl font-bold border border-white/10 hover:bg-white/10 transition-all">
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#020617] text-white overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-[#0f172a] border-r border-white/5 fixed inset-y-0 left-0 flex flex-col z-[100]">
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center text-xl font-black shadow-xl shadow-orange-900/40 outfit border border-white/20">X</div>
                        <div>
                            <span className="block font-black text-xl tracking-tighter outfit">Admin Core</span>
                            <span className="block text-[10px] font-black text-orange-500 uppercase tracking-widest">Root Instance</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-2 mt-4">
                    <AdminNavItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeView === 'overview'} onClick={() => setActiveView('overview')} />
                    <AdminNavItem icon={<ClipboardList size={20} />} label="Waitlist" active={activeView === 'waitlist'} onClick={() => setActiveView('waitlist')} />
                    <AdminNavItem icon={<Users size={20} />} label="Corporate Units" active={activeView === 'companies'} onClick={() => setActiveView('companies')} />
                    <AdminNavItem icon={<ClipboardList size={20} />} label="Data Streams" active={activeView === 'tasks'} onClick={() => setActiveView('tasks')} />
                    <AdminNavItem icon={<Wallet size={20} />} label="Treasury Flow" active={activeView === 'payouts'} onClick={() => setActiveView('payouts')} />
                    <AdminNavItem icon={<ShieldCheck size={20} />} label="Admin Users" active={activeView === 'admins'} onClick={() => setActiveView('admins')} />
                </nav>

                <div className="p-6 border-t border-white/5 bg-black/20">
                    <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center font-black outfit">{userEmail.charAt(0).toUpperCase()}</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black truncate">{user.fullName}</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest truncate">{userEmail}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-4 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest border border-transparent hover:border-red-500/20">
                        <LogOut size={16} /> Sign Out Admin
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-72 p-12 bg-[#020617] relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/5 blur-[120px] rounded-full -mr-40 -mt-20 pointer-events-none" />

                {activeView === 'overview' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <header>
                            <h1 className="text-4xl font-black outfit text-white tracking-tighter">Command Overview</h1>
                            <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-xs">Global Protocol Status</p>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <AdminStatCard label="Total Organizations" value="42" icon={<Users />} color="blue" />
                            <AdminStatCard label="Active Data Flows" value="128" icon={<Zap size={20} />} color="orange" />
                            <AdminStatCard label="Revenue Target" value="$1.2M" icon={<Wallet />} color="emerald" />
                            <AdminStatCard label="System Integrity" value="99.9%" icon={<ShieldCheck />} color="purple" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="glass-card p-8 border-white/5">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3"><Activity size={20} className="text-orange-500" /> Live Feed</h3>
                                <div className="space-y-4 opacity-30 text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                                    <p className="font-bold text-xs uppercase tracking-widest">No active signals detected...</p>
                                </div>
                            </div>
                            <div className="glass-card p-8 border-white/5">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3"><CheckCircle2 size={20} className="text-green-500" /> Pending Approvals</h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold">New Marketplace Dataset</p>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">XUM-B-9921</p>
                                        </div>
                                        <button className="px-4 py-2 bg-orange-600 rounded-xl text-[10px] font-black uppercase">Review</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'waitlist' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <header>
                            <h1 className="text-4xl font-black outfit text-white tracking-tighter">Waitlist Applications</h1>
                            <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-xs">Manage early access requests</p>
                        </header>

                        <div className="glass-card overflow-hidden border-white/5">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.02]">
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Applicant</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Contact Details</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Interest</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Consent</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {waitlist.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">No applications found...</td>
                                            </tr>
                                        ) : (
                                            waitlist.map((item) => (
                                                <tr key={item.id} className="group hover:bg-white/[0.01] transition-colors">
                                                    <td className="p-6">
                                                        <p className="font-bold text-white mb-1">{item.full_name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin size={10} className="text-blue-500" />
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.country || 'Unknown Location'}</span>
                                                        </div>
                                                        {item.company && <p className="text-[10px] text-orange-500 font-black uppercase mt-1">@ {item.company}</p>}
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                                                                <Mail size={12} className="text-slate-500" /> {item.email}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                                                                <Phone size={12} className="text-slate-500" /> {item.phone || 'No phone'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">
                                                            {item.interest}
                                                        </span>
                                                    </td>
                                                    <td className="p-6 text-center">
                                                        {item.consent ? (
                                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-[9px] font-black text-green-500 uppercase tracking-widest">Yes</div>
                                                        ) : (
                                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[9px] font-black text-red-500 uppercase tracking-widest">No</div>
                                                        )}
                                                    </td>
                                                    <td className="p-6">
                                                        <select
                                                            value={item.status}
                                                            onChange={(e) => handleUpdateWaitlistStatus(item.id, e.target.value)}
                                                            className={`bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer ${item.status === 'approved' ? 'text-green-500' :
                                                                    item.status === 'contacted' ? 'text-blue-500' : 'text-orange-500'
                                                                }`}
                                                        >
                                                            <option value="pending" className="bg-[#0f172a]">Pending</option>
                                                            <option value="contacted" className="bg-[#0f172a]">Contacted</option>
                                                            <option value="approved" className="bg-[#0f172a]">Approved</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-6 text-right space-x-2">
                                                        <button
                                                            onClick={() => handleDeleteWaitlist(item.id)}
                                                            className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'admins' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <header className="flex justify-between items-end">
                            <div>
                                <h1 className="text-4xl font-black outfit text-white tracking-tighter">Security Council</h1>
                                <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-xs">Authorized Admin Users</p>
                            </div>
                            <button
                                onClick={() => setIsAddingAdmin(true)}
                                className="px-6 py-4 bg-white text-black rounded-2xl font-black outfit text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
                            >
                                <UserPlus size={18} /> Add New Admin
                            </button>
                        </header>

                        <div className="glass-card p-8 border-white/5">
                            <div className="divide-y divide-white/5">
                                {admins.map(admin => (
                                    <div key={admin.id} className="py-6 flex justify-between items-center group">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 font-bold group-hover:bg-orange-600/10 group-hover:text-orange-500 transition-all">
                                                {admin.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-black text-lg text-white">{admin.email}</p>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    {admin.email === MASTER_ADMIN ? 'Foundation Master' : 'Regional Admin'}
                                                </p>
                                            </div>
                                        </div>
                                        {admin.email !== MASTER_ADMIN && (
                                            <button
                                                onClick={() => handleRemoveAdmin(admin.email)}
                                                className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                        {admin.email === MASTER_ADMIN && (
                                            <div className="px-4 py-1.5 bg-orange-600/10 border border-orange-500/20 rounded-full text-orange-500 text-[9px] font-black uppercase tracking-widest">Immortal Node</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Other views placeholder */}
                {['companies', 'tasks', 'payouts'].includes(activeView) && (
                    <div className="flex flex-col items-center justify-center py-40 opacity-20">
                        <ShieldAlert size={80} className="mb-6" />
                        <p className="font-black outfit text-2xl uppercase tracking-[0.2em]">Module Syncing...</p>
                    </div>
                )}
            </main>

            {/* Add Admin Modal */}
            {isAddingAdmin && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl" onClick={() => setIsAddingAdmin(false)} />
                    <div className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-[3rem] p-10 shadow-3xl animate-in zoom-in-95 duration-300">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-black outfit text-white mb-2 tracking-tight">Expand Council</h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Provision Admin Clearance</p>
                        </div>
                        <label className="block mb-8">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Email Address</span>
                            <input
                                type="email"
                                placeholder="name@xumai.app"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-orange-500/50 transition-all font-mono"
                                value={newAdminEmail}
                                onChange={(e) => setNewAdminEmail(e.target.value)}
                            />
                        </label>
                        <div className="flex gap-4">
                            <button onClick={() => setIsAddingAdmin(false)} className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all">Cancel</button>
                            <button onClick={handleAddAdmin} className="flex-[2] py-4 bg-orange-600 text-white rounded-2xl font-black outfit text-sm hover:bg-orange-500 transition-all shadow-xl shadow-orange-950/40">Confirm Admin</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminNavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }> = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all relative group ${active ? 'bg-orange-600 text-white shadow-xl shadow-orange-950/40 translate-x-3' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
        <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</div>
        <span className="text-xs font-black uppercase tracking-widest">{label}</span>
        {active && <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full" />}
    </button>
);

const AdminStatCard: React.FC<{ label: string; value: string; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => {
    const colors: any = {
        blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
        emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    };
    return (
        <div className="glass-card p-8 border-white/5 group hover:border-white/10 transition-all">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${colors[color]}`}>
                {icon}
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
            <p className="text-3xl font-black outfit text-white tracking-tighter">{value}</p>
        </div>
    );
};

export default AdminPanel;
