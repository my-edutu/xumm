import React, { useState } from 'react';
import {
    User,
    Shield,
    Bell,
    Key,
    Users,
    Globe,
    Mail,
    Lock,
    Save,
    Plus,
    Trash2,
    Copy,
    Check
} from 'lucide-react';

export default function Settings() {
    const [activeSection, setActiveSection] = useState('profile');
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(id);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const renderProfile = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-6 p-6 glass-card border-white/5">
                <div className="relative group">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-xl shadow-orange-950/40">
                        XA
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2 bg-slate-800 border border-white/10 rounded-lg text-white hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100">
                        <User size={16} />
                    </button>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">XUM AI Corp</h3>
                    <p className="text-slate-400 text-sm mt-1">Enterprise Subscription • Since Jan 2025</p>
                    <div className="flex gap-2 mt-3">
                        <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-md">Verified</span>
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest rounded-md">Master Admin</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <label className="block">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Company Name</span>
                        <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500/50 transition-all font-medium" defaultValue="XUM AI Corp" />
                    </label>
                    <label className="block">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Contact Email</span>
                        <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500/50 transition-all font-medium" defaultValue="admin@xum.ai" />
                    </label>
                </div>
                <div className="space-y-4">
                    <label className="block">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Industry</span>
                        <select className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500/50 transition-all font-medium appearance-none">
                            <option>Artificial Intelligence</option>
                            <option>Data Labeling</option>
                            <option>Blockchain</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Timezone</span>
                        <select className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500/50 transition-all font-medium appearance-none">
                            <option>Lagos, Nigeria (GMT+1)</option>
                            <option>Nairobi, Kenya (GMT+3)</option>
                            <option>UTC (GMT+0)</option>
                        </select>
                    </label>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-white/5">
                <button className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-orange-500 transition-all shadow-lg shadow-orange-950/20 active:scale-95">
                    <Save size={18} /> Update Profile
                </button>
            </div>
        </div>
    );

    const renderSecurity = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="glass-card p-6 border-white/5">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-white">Password & Security</h3>
                        <p className="text-slate-400 text-xs mt-1">Manage your account authentication settings.</p>
                    </div>
                    <Shield className="text-orange-500" size={24} />
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                                <Lock size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Two-Factor Authentication</p>
                                <p className="text-xs text-slate-500">Add an extra layer of security to your account.</p>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase tracking-wider">Enable</button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-500/10 rounded-xl flex items-center justify-center text-slate-400">
                                    <Key size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-sm">Change Password</p>
                                    <p className="text-xs text-slate-500">Last changed 3 months ago</p>
                                </div>
                            </div>
                            <Plus size={18} className="text-slate-500" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="glass-card p-6 border-white/5">
                <h3 className="text-lg font-bold text-white mb-6">Active Sessions</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <Globe className="text-green-500" size={20} />
                            <div>
                                <p className="text-sm font-bold">Lagos, Nigeria</p>
                                <p className="text-xs text-slate-500">Chrome on macOS • IP: 102.164.20.12</p>
                            </div>
                        </div>
                        <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-md">Current</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderApiKeys = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white">API Management</h3>
                    <p className="text-slate-400 text-sm mt-1">Connect your applications to the XUM Intelligence Matrix.</p>
                </div>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Plus size={16} /> Create New Key
                </button>
            </div>

            <div className="space-y-4">
                {[
                    { id: '1', name: 'Production Backend', key: 'xk_live_51P8...9w21', lastUsed: '2 mins ago', created: 'Jan 12, 2025' },
                    { id: '2', name: 'Sandbox Env', key: 'xk_test_51P8...k8s0', lastUsed: '5 days ago', created: 'Jan 15, 2025' }
                ].map((key) => (
                    <div key={key.id} className="p-6 glass-card border-white/5 hover:border-orange-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-bold text-white group-hover:text-orange-500 transition-colors">{key.name}</h4>
                                <div className="flex items-center gap-3 mt-2">
                                    <code className="bg-black/40 px-3 py-1.5 rounded-lg text-orange-400 font-mono text-sm border border-white/5 flex items-center gap-3">
                                        {key.key}
                                        <button
                                            onClick={() => copyToClipboard(key.key, key.id)}
                                            className="text-slate-500 hover:text-white transition-colors"
                                        >
                                            {copiedKey === key.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                        </button>
                                    </code>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-6 mt-4 pt-4 border-t border-white/5 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                            <span>Last Used: <span className="text-slate-300">{key.lastUsed}</span></span>
                            <span>Created: <span className="text-slate-300">{key.created}</span></span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex gap-4 items-start">
                <div className="p-2 bg-blue-500/20 rounded-xl text-blue-500 shadow-lg shadow-blue-500/10">
                    <Key size={20} />
                </div>
                <div>
                    <h5 className="font-bold text-blue-400 text-sm">Security Best Practice</h5>
                    <p className="text-xs text-blue-500/80 mt-1 leading-relaxed">
                        Never share your API keys or expose them in client-side code. Use environment variables to keep them secure.
                        Keys should be rotated every 90 days for maximum security.
                    </p>
                </div>
            </div>
        </div>
    );

    const renderNotifications = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="glass-card p-6 border-white/5">
                <h3 className="text-lg font-bold text-white mb-6">Channel Preferences</h3>
                <div className="space-y-4">
                    {[
                        { title: 'Project Milestones', desc: 'Alert when a project reaches major progress points.', icon: Globe },
                        { title: 'Quality Alerts', desc: 'Emergency alerts for sudden drops in data accuracy.', icon: Shield },
                        { title: 'Financial Reports', desc: 'Weekly summaries of spend and rewards distribution.', icon: Mail },
                        { title: 'System Updates', desc: 'Information about new platform features and maintenance.', icon: Bell }
                    ].map((pref, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl group hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                                    <pref.icon size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-white">{pref.title}</p>
                                    <p className="text-xs text-slate-500">{pref.desc}</p>
                                </div>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked={i < 3} />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-12">
            <header>
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-orange-500/10 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.1)] ring-1 ring-orange-500/20">
                        <Users className="text-orange-500" size={24} />
                    </div>
                    <h1 className="text-3xl font-bold outfit">System Settings</h1>
                </div>
                <p className="text-slate-400 mt-2 font-medium">Fine-tune your environment, manage security, and configure API access.</p>
            </header>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Internal Navigation */}
                <div className="lg:w-72 space-y-2">
                    {[
                        { id: 'profile', label: 'Company Profile', icon: User },
                        { id: 'security', label: 'Security & Privacy', icon: Shield },
                        { id: 'api', label: 'API & Integrations', icon: Key },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'team', label: 'Team Management', icon: Users }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeSection === item.id
                                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-950/20 translate-x-2'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 min-h-[600px] shadow-2xl">
                    {activeSection === 'profile' && renderProfile()}
                    {activeSection === 'security' && renderSecurity()}
                    {activeSection === 'api' && renderApiKeys()}
                    {activeSection === 'notifications' && renderNotifications()}
                    {activeSection === 'team' && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20">
                            <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500 border border-orange-500/20">
                                <Users size={40} />
                            </div>
                            <h3 className="text-2xl font-bold">Team Access Logic</h3>
                            <p className="text-slate-400 max-w-sm">The dedicated team management module is currently being finalized for high-concurrency environments.</p>
                            <button className="px-6 py-3 bg-white/5 rounded-xl font-bold text-sm text-slate-300 pointer-events-none border border-white/5 opacity-50">Coming Soon</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
