import React, { useState } from 'react';
import ProjectDetail from './pages/ProjectDetail';
import Billing from './pages/Billing';
import Analytics from './pages/Analytics';
import WorkerAnalytics from './pages/WorkerAnalytics';
import AlertsAndReports from './pages/AlertsAndReports';
import Marketplace from './pages/Marketplace';
import SettingsPage from './pages/Settings';
import {
    LayoutDashboard,
    Briefcase,
    BarChart3,
    Wallet,
    ShoppingBag,
    Settings as SettingsIcon,
    LogOut,
    Plus,
    TrendingUp,
    Users,
    CheckCircle2,
    Bell,
    Search,
    UserCog,
    ChevronDown,
    Menu
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const data = [
    { name: 'Mon', submissions: 400, accuracy: 95 },
    { name: 'Tue', submissions: 300, accuracy: 92 },
    { name: 'Wed', submissions: 600, accuracy: 98 },
    { name: 'Thu', submissions: 800, accuracy: 96 },
    { name: 'Fri', submissions: 500, accuracy: 94 },
    { name: 'Sat', submissions: 200, accuracy: 90 },
    { name: 'Sun', submissions: 100, accuracy: 88 },
];

export default function App() {
    const [activeTab, setActiveTab] = useState('analytics');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedProject, setSelectedProject] = useState<any>(null);

    const navigateTo = (tab: string) => {
        setActiveTab(tab);
        setSelectedProject(null);
        if (window.innerWidth < 1024) setSidebarOpen(false);
    };

    return (
        <div className="flex min-h-screen bg-[#020617] text-slate-100 font-inter">
            {/* Fixed Header */}
            <header className="fixed top-0 left-0 right-0 h-20 bg-[#020617]/90 backdrop-blur-2xl border-b border-white/5 z-[200] flex items-center justify-between px-6 md:px-8">
                <div className="flex items-center gap-4">
                    {/* Logo */}
                    <div className="flex flex-col">
                        <span className="text-2xl font-black tracking-tighter outfit leading-none text-white flex items-center gap-2">
                            XUM <span className="text-orange-500 font-light">Business</span>
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-1">Enterprise Hub</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Desktop Profile Badge */}
                    <div className="hidden md:flex items-center gap-3 px-1.5 py-1.5 bg-white/5 hover:bg-white/10 transition-all rounded-full border border-white/5 cursor-pointer group pr-4">
                        <div className="w-9 h-9 bg-orange-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white/10 group-hover:scale-105 transition-transform overflow-hidden">
                            <img
                                src="https://api.dicebear.com/7.x/initials/svg?seed=Global%20AI&backgroundColor=f97316"
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-100 group-hover:text-orange-500 transition-colors">Global AI Corp</span>
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">LTD Enterprise</span>
                        </div>
                    </div>

                    {/* Mobile Menu Button - Moved to Right */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white active:scale-95 transition-all outline-none border border-white/20 z-[400]"
                    >
                        <div className="relative w-5 h-4 flex flex-col justify-between items-center">
                            <span className={`block w-full h-0.5 bg-white rounded-full transition-all duration-300 ${sidebarOpen ? 'rotate-45 translate-y-[7px]' : ''}`}></span>
                            <span className={`block w-full h-0.5 bg-white rounded-full transition-all duration-300 ${sidebarOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                            <span className={`block w-full h-0.5 bg-white rounded-full transition-all duration-300 ${sidebarOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}></span>
                        </div>
                    </button>
                </div>
            </header>

            {/* Adjusted Sidebar */}
            <aside
                className={`sidebar bg-[#0f172a]/98 backdrop-blur-3xl border-l border-r border-white/5 flex flex-col fixed inset-y-0 z-[500] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                    md:left-0
                    ${sidebarOpen ? 'md:w-64 translate-x-0' : 'md:w-20 translate-x-0'}
                    
                    max-md:right-0 max-md:w-72 max-md:border-l max-md:border-white/10
                    ${sidebarOpen ? 'max-md:translate-x-0' : 'max-md:translate-x-full'}
                `}
            >
                {/* Sidebar Top Nav */}
                <div className="h-20 md:h-24 flex items-center justify-between px-6 border-b border-white/5 mb-2">
                    <span className={`text-2xl font-black text-orange-500 outfit transition-all duration-300 ${!sidebarOpen ? 'md:scale-75 md:origin-left' : ''}`}>XUM</span>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                        <Plus size={24} className="rotate-45" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1.5 px-3 overflow-y-auto no-scrollbar">
                    {/* Desktop Sidebar Toggle - Relocated to Nav List */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`hidden md:flex items-center rounded-xl transition-all duration-300 text-slate-500 hover:text-white hover:bg-white/5 mb-4 group
                            ${sidebarOpen ? 'w-full px-4 py-3 gap-3' : 'w-10 h-10 justify-center mx-auto'}`}
                    >
                        <Menu size={18} className={`transition-transform duration-500 ${!sidebarOpen ? 'rotate-180' : ''}`} />
                        {sidebarOpen && <span className="text-[10px] font-bold uppercase tracking-widest animate-in fade-in duration-300 tracking-[0.2em]">Minimize</span>}
                    </button>
                    <SidebarItem
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        active={activeTab === 'analytics'}
                        onClick={() => navigateTo('analytics')}
                        collapsed={!sidebarOpen}
                    />
                    <SidebarItem
                        icon={<Briefcase size={20} />}
                        label="Workspaces"
                        active={activeTab === 'projects'}
                        onClick={() => navigateTo('projects')}
                        collapsed={!sidebarOpen}
                    />
                    <SidebarItem
                        icon={<Users size={20} />}
                        label="Workforce"
                        active={activeTab === 'workforce'}
                        onClick={() => navigateTo('workforce')}
                        collapsed={!sidebarOpen}
                    />
                    <SidebarItem
                        icon={<Bell size={20} />}
                        label="Alerts"
                        active={activeTab === 'alerts'}
                        onClick={() => navigateTo('alerts')}
                        collapsed={!sidebarOpen}
                    />
                    <SidebarItem
                        icon={<Wallet size={20} />}
                        label="Billing"
                        active={activeTab === 'budget'}
                        onClick={() => navigateTo('budget')}
                        collapsed={!sidebarOpen}
                    />
                    <SidebarItem
                        icon={<ShoppingBag size={20} />}
                        label="Marketplace"
                        active={activeTab === 'market'}
                        onClick={() => navigateTo('market')}
                        collapsed={!sidebarOpen}
                    />
                </nav>

                <div className="mt-auto space-y-2 p-4 border-t border-white/5 bg-black/20">
                    <SidebarItem
                        icon={<SettingsIcon size={20} />}
                        label="Settings"
                        active={activeTab === 'settings'}
                        onClick={() => navigateTo('settings')}
                        collapsed={!sidebarOpen}
                    />
                    <SidebarItem
                        icon={<LogOut size={20} />}
                        label="Logout"
                        className="text-slate-500 hover:text-red-400"
                        collapsed={!sidebarOpen}
                    />
                </div>
            </aside>

            {/* Background Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[450] md:hidden animate-in fade-in duration-500"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} p-4 md:p-8 pt-24 md:pt-32`}>

                {selectedProject ? (
                    <ProjectDetail
                        project={selectedProject}
                        onBack={() => setSelectedProject(null)}
                    />
                ) : activeTab === 'projects' ? (
                    <div className="animate-slide-up">
                        <header className="flex justify-between items-center mb-12 text-white">
                            <div>
                                <h1 className="text-3xl font-bold">My Workspaces</h1>
                                <p className="text-slate-400 mt-2 font-medium">Manage all your independent data production campaigns.</p>
                            </div>
                            <button className="px-6 py-4 bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-900/20 flex items-center gap-2 active:scale-95 transition-all">
                                <Plus size={18} /> New Campaign
                            </button>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div className="glass-card p-6 border-l-4 border-l-blue-500">
                                <p className="text-xs text-dim font-bold uppercase tracking-wider">Total Projects</p>
                                <h2 className="text-3xl font-black mt-1">24</h2>
                            </div>
                            <div className="glass-card p-6 border-l-4 border-l-green-500">
                                <p className="text-xs text-dim font-bold uppercase tracking-wider">Live Batches</p>
                                <h2 className="text-3xl font-black mt-1">1,204</h2>
                            </div>
                            <div className="glass-card p-6 border-l-4 border-l-primary">
                                <p className="text-xs text-dim font-bold uppercase tracking-wider">Throughput</p>
                                <h2 className="text-3xl font-black mt-1">94%</h2>
                            </div>
                        </div>

                        <div className="glass-card overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/5 text-slate-400 text-sm uppercase tracking-wider">
                                        <th className="px-6 py-4 font-semibold text-white">Project Identity</th>
                                        <th className="px-6 py-4 font-semibold text-white">Operational Status</th>
                                        <th className="px-6 py-4 font-semibold text-white">Efficiency</th>
                                        <th className="px-6 py-4 font-semibold text-white">Spend</th>
                                        <th className="px-6 py-4 font-semibold text-white text-right">Audit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 shadow-inner">
                                    <ProjectRow
                                        name="Swahili NLP Tuning"
                                        id="PJ-2025-001"
                                        status="Active"
                                        progress={75}
                                        cost="$1,240"
                                        onManage={() => setSelectedProject({ name: "Swahili NLP Tuning", id: "PJ-2025-001", status: "Active", progress: 75, cost: "$1,240" })}
                                    />
                                    <ProjectRow
                                        name="Yoruba Voice RLHF"
                                        id="PJ-2025-004"
                                        status="Review"
                                        progress={100}
                                        cost="$2,150"
                                        onManage={() => setSelectedProject({ name: "Yoruba Voice RLHF", id: "PJ-2025-004", status: "Review", progress: 100, cost: "$2,150" })}
                                    />
                                    <ProjectRow
                                        name="East African Landmark ID"
                                        id="PJ-2025-009"
                                        status="Active"
                                        progress={12}
                                        cost="$450"
                                        onManage={() => { }}
                                    />
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'budget' ? (
                    <Billing />
                ) : activeTab === 'analytics' ? (
                    <Analytics onNavigate={navigateTo} />
                ) : activeTab === 'workforce' ? (
                    <WorkerAnalytics onBack={() => navigateTo('analytics')} />
                ) : activeTab === 'alerts' ? (
                    <AlertsAndReports />
                ) : activeTab === 'market' ? (
                    <Marketplace />
                ) : activeTab === 'settings' ? (
                    <SettingsPage />
                ) : (
                    <Analytics />
                )}
            </main>
        </div>
    );
}

function SidebarItem({ icon, label, active = false, onClick, className = "", collapsed = false }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center rounded-xl transition-all duration-300 group relative
                ${active ? 'bg-orange-500/10 text-orange-500 font-semibold' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}
                ${collapsed ? 'w-12 h-12 justify-center px-0 mx-auto' : 'w-full px-4 py-3 gap-3'}
                ${className}`}
        >
            <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                {icon}
            </div>
            {!collapsed && (
                <span className="truncate animate-in fade-in slide-in-from-left-2 duration-300">{label}</span>
            )}

            {/* Tooltip for collapsed state */}
            {collapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 z-[130] whitespace-nowrap shadow-2xl border border-white/10 -translate-x-2 group-hover:translate-x-0">
                    {label}
                </div>
            )}
        </button>
    );
}


function StatCard({ title, value, icon, trend }: any) {
    return (
        <div className="glass-card p-6 border-white/5">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/5 rounded-xl">
                    {icon}
                </div>
                <span className="text-xs font-medium text-slate-400 px-2 py-1 bg-white/5 rounded-full">{trend}</span>
            </div>
            <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold mt-1 outfit">{value}</p>
        </div>
    );
}

function ProjectTypeItem({ title, count, color }: any) {
    return (
        <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center text-white`}>
                <Briefcase size={20} />
            </div>
            <div>
                <h4 className="font-semibold group-hover:text-orange-500 transition-colors tracking-tight text-white">{title}</h4>
                <p className="text-xs text-slate-400">{count}</p>
            </div>
        </div>
    );
}

function ProjectRow({ name, status, progress, cost, id, onManage }: any) {
    return (
        <tr className="hover:bg-white/5 transition-colors group">
            <td className="px-6 py-4 font-medium">
                <div className="text-white font-bold">{name}</div>
                <div className="text-xs text-slate-500 font-normal">{id}</div>
            </td>
            <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${status === 'Active' ? 'bg-green-500/20 text-green-500' :
                    status === 'Paused' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-blue-500/20 text-blue-500'
                    }`}>
                    {status}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3 min-w-[120px]">
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-600" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="text-xs text-slate-400 font-bold">{progress}%</span>
                </div>
            </td>
            <td className="px-6 py-4 font-bold text-emerald-500">{cost}</td>
            <td className="px-6 py-4 text-right">
                <button
                    onClick={onManage}
                    className="px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-black uppercase text-slate-300 transition-all border border-white/5"
                >
                    Manage
                </button>
            </td>
        </tr>
    );
}
