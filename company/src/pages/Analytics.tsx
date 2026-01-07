import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Activity,
    Target,
    Users,
    Clock,
    ChevronDown,
    Globe,
    Download,
    RefreshCw,
    Filter,
    Calendar,
    Zap,
    Award,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    Briefcase,
    ShoppingBag,
    Bell,
    Wallet,
    Settings as SettingsIcon
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    LineChart,
    Line,
    Legend,
    ComposedChart
} from 'recharts';
import analyticsService, {
    AnalyticsOverview,
    TimeSeriesData,
    GeoDistribution,
    SubmissionStatus,
    DashboardKPIs,
    WorkerMetrics
} from '../services/analyticsService';

const COLORS = {
    primary: '#f97316',
    secondary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#a855f7',
    pink: '#ec4899',
    slate: '#64748b'
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.purple];

type DateRange = '7d' | '14d' | '30d' | '90d';

export default function Analytics({ onNavigate }: { onNavigate?: (tab: string) => void }) {
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange>('7d');
    const [activeTab, setActiveTab] = useState<'overview' | 'workers' | 'quality' | 'financial'>('overview');

    // Analytics Data State
    const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
    const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);
    const [geoData, setGeoData] = useState<GeoDistribution[]>([]);
    const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus | null>(null);
    const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
    const [topWorkers, setTopWorkers] = useState<WorkerMetrics[]>([]);

    const getDays = (range: DateRange): number => {
        switch (range) {
            case '7d': return 7;
            case '14d': return 14;
            case '30d': return 30;
            case '90d': return 90;
            default: return 7;
        }
    };

    const fetchAnalytics = async () => {
        setIsLoading(true);
        // Ensure we are using the latest dateRange
        const days = getDays(dateRange);
        try {
            const [overviewData, timeSeriesData, geoDistribution, statusData, kpiData, workers] = await Promise.all([
                analyticsService.getOverview(),
                analyticsService.getTimeSeries(days),
                analyticsService.getGeoDistribution(),
                analyticsService.getSubmissionStatus(),
                analyticsService.getKPITrends(),
                analyticsService.getWorkerMetrics(12)
            ]);

            setOverview(overviewData);
            setTimeSeries(timeSeriesData);
            setGeoData(geoDistribution);
            setSubmissionStatus(statusData);
            setKpis(kpiData);
            setTopWorkers(workers);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const handleExport = async () => {
        const csv = await analyticsService.exportReport('csv');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const renderOverview = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Launchpad Grid - Elite Mobile Matrix: 2 columns, balanced gutter */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <NavCard
                    title="Active Workspaces"
                    desc="Manage your data production pipelines."
                    icon={<Briefcase className="text-blue-500" size={24} />}
                    onClick={() => onNavigate?.('projects')}
                    stats="24 Live Projects"
                    pattern="bg-inspire-blue"
                />
                <NavCard
                    title="Workforce Intelligence"
                    desc="Track worker growth and regional stats."
                    icon={<Users className="text-purple-500" size={24} />}
                    onClick={() => setActiveTab('workers')}
                    stats="3,420 Active Agents"
                    pattern="bg-inspire-purple"
                />
                <NavCard
                    title="Quality Control"
                    desc="Monitor accuracy and consensus rates."
                    icon={<Target className="text-green-500" size={24} />}
                    onClick={() => setActiveTab('quality')}
                    stats="96.4% Avg Accuracy"
                    pattern="bg-inspire-green"
                />
                <NavCard
                    title="Financial Ledger"
                    desc="Review spent and budget allocation."
                    icon={<DollarSign className="text-white" size={24} />}
                    onClick={() => setActiveTab('financial')}
                    stats="$18,750 Used"
                    pattern="bg-inspire-orange"
                />
                <NavCard
                    title="Data Marketplace"
                    desc="Exchange and acquire specialized datasets."
                    icon={<ShoppingBag className="text-orange-500" size={24} />}
                    onClick={() => onNavigate?.('market')}
                    stats="4.2M Samples"
                    pattern="bg-inspire-teal"
                />
                <NavCard
                    title="Alerts & Reports"
                    desc="System notifications and scheduled intel."
                    icon={<Bell className="text-pink-500" size={24} />}
                    onClick={() => onNavigate?.('alerts')}
                    stats="2 Pending Alerts"
                    pattern="bg-inspire-blue"
                />
                <NavCard
                    title="Budget & Billing"
                    desc="Manage deposits and payment methods."
                    icon={<Wallet className="text-white" size={24} />}
                    onClick={() => onNavigate?.('budget')}
                    stats="Healthy"
                    pattern="bg-inspire-orange"
                />
                <NavCard
                    title="System Settings"
                    desc="Configure security and API access."
                    icon={<SettingsIcon className="text-slate-400" size={24} />}
                    onClick={() => onNavigate?.('settings')}
                    stats="Secure Matrix"
                    pattern="bg-inspire-purple"
                />
            </div>

            {/* Quick Status Section - Redesigned for Minimalist Premium */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6 md:p-10 bg-[#0f172a]/60 border-orange-500/20 relative overflow-hidden group hover:border-orange-500/40 transition-all duration-500">
                    {/* Subtle Glow Accent */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.5)]"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8 md:mb-12">
                            <div>
                                <h3 className="text-lg md:text-2xl font-extrabold tracking-tight outfit text-white">Core Metrics</h3>
                                <p className="text-slate-400 mt-1 text-[12px] md:text-base font-medium max-w-md">Aggregated platform performance across active pipelines.</p>
                            </div>
                            <div className="p-4 bg-orange-500/5 rounded-3xl text-orange-500 hidden md:block border border-orange-500/10">
                                <Activity size={32} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                            <div className="space-y-2 group">
                                <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-orange-500/50 transition-colors">Active Tasks</p>
                                <p className="text-3xl md:text-4xl lg:text-5xl font-black outfit text-white">1,240</p>
                                <div className="flex items-center gap-1.5 text-xs text-green-400 font-bold">
                                    <TrendingUp size={14} /> +5.2% Activity
                                </div>
                            </div>
                            <div className="space-y-2 group">
                                <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-orange-500/50 transition-colors">Total Budget</p>
                                <p className="text-3xl md:text-4xl lg:text-5xl font-black outfit text-white">$45.2K</p>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                                    Of $100K Allocated
                                </div>
                            </div>
                            <div className="space-y-2 group">
                                <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-orange-500/50 transition-colors">Active Workforce</p>
                                <p className="text-3xl md:text-4xl lg:text-5xl font-black outfit text-white">3,420</p>
                                <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">Verified Agents</p>
                            </div>
                            <div className="space-y-2 group">
                                <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-orange-500/50 transition-colors">Success Rate</p>
                                <p className="text-3xl md:text-4xl lg:text-5xl font-black text-green-400 outfit">98.2%</p>
                                <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">Across All Sectors</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 md:p-10 bg-[#0f172a]/60 border-purple-500/20 relative overflow-hidden group hover:border-purple-500/40 transition-all duration-500">
                    {/* Subtle Glow Accent */}
                    <div className="absolute top-0 right-0 w-1 h-full bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]"></div>

                    <div className="relative z-10">
                        <h3 className="text-lg md:text-2xl font-extrabold outfit mb-6 flex items-center gap-3 text-white">
                            <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-500 border border-yellow-500/10">
                                <Zap size={20} />
                            </div>
                            Platform Pulse
                        </h3>
                        <div className="space-y-4">
                            <div className="p-5 bg-white/5 border border-white/5 rounded-3xl group/item hover:bg-orange-500/5 hover:border-orange-500/20 transition-all cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <p className="text-xs font-black text-orange-500 uppercase tracking-widest">Purchase Request</p>
                                    <span className="text-[10px] text-slate-500 font-bold">PENDING</span>
                                </div>
                                <p className="text-sm text-slate-100 font-semibold mt-2">50,000 Swahili Audio Tokens</p>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">System awaiting internal budget verification for Hub-2 acquisition.</p>
                            </div>
                            <div className="p-5 bg-white/5 border border-white/5 rounded-3xl group/item hover:bg-blue-500/5 hover:border-blue-500/20 transition-all cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <p className="text-xs font-black text-blue-500 uppercase tracking-widest">Inventory Update</p>
                                    <span className="text-[10px] text-slate-500 font-bold">2H AGO</span>
                                </div>
                                <p className="text-sm text-slate-100 font-semibold mt-2">Batch-04 Production Complete</p>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">12,400 verified sentiment markers ready for export to workspace.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderWorkforce = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-6 bg-inspire-blue overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-sm text-slate-100/60 font-bold uppercase tracking-wider">Total Workforce</p>
                        <h4 className="text-4xl font-black mt-2 outfit">3,420</h4>
                        <div className="flex items-center gap-1.5 text-xs text-green-400 mt-2 font-black">
                            <TrendingUp size={12} /> +12 NEW
                        </div>
                    </div>
                </div>
                <div className="glass-card p-6 bg-inspire-purple overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-sm text-slate-100/60 font-bold uppercase tracking-wider">Avg Work Time</p>
                        <h4 className="text-4xl font-black mt-2 outfit">4.2h/day</h4>
                        <p className="text-xs text-slate-300/50 mt-2 font-black uppercase tracking-widest">Platform Average</p>
                    </div>
                </div>
                <div className="glass-card p-6 bg-inspire-green overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-sm text-slate-100/60 font-bold uppercase tracking-wider">Retention Rate</p>
                        <h4 className="text-4xl font-black mt-2 outfit">88%</h4>
                        <div className="flex items-center gap-1.5 text-xs text-green-400 mt-2 font-black">
                            <TrendingUp size={12} /> +2% VS MO
                        </div>
                    </div>
                </div>
                <div className="glass-card p-6 bg-inspire-orange overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-sm text-slate-100/60 font-bold uppercase tracking-wider">Active Regions</p>
                        <h4 className="text-4xl font-black mt-2 outfit">12</h4>
                        <p className="text-xs text-slate-300/50 mt-2 font-black uppercase tracking-widest">Pan-African Hubs</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6">
                    <h3 className="text-xl font-bold outfit mb-6">Workforce Growth</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={timeSeries}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => new Date(v).toLocaleDateString('en', { day: 'numeric', month: 'short' })} />
                                <YAxis stroke="#94a3b8" fontSize={11} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} />
                                <Bar dataKey="workers" fill={COLORS.secondary} radius={[4, 4, 0, 0]} name="Active Workers" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold outfit mb-6">Regional Distribution</h3>
                    <div className="space-y-5">
                        {geoData.slice(0, 5).map((region, id) => (
                            <div key={id} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">{region.country}</span>
                                    <span className="text-slate-400">{region.workers} workers</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${(region.workers / 1500) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="glass-card p-6">
                <h3 className="text-xl font-bold outfit mb-6 flex items-center gap-2">
                    <Award size={20} className="text-yellow-500" />
                    MVP Contributors
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {topWorkers.slice(0, 8).map((worker, index) => (
                        <WorkerCard key={worker.id} worker={worker} rank={index + 1} />
                    ))}
                </div>
            </div>
        </div>
    );

    const renderQuality = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-8 border-l-4 border-green-500 bg-inspire-green overflow-hidden relative">
                    <div className="relative z-10">
                        <h4 className="text-slate-100/60 text-sm font-bold uppercase tracking-wider">Avg Accuracy</h4>
                        <p className="text-6xl font-black mt-4 outfit text-white">96.4%</p>
                        <div className="flex items-center gap-1.5 text-xs text-green-400 mt-4 font-black bg-green-500/10 w-fit px-2 py-1 rounded-lg">
                            <TrendingUp size={14} /> +0.8% VELOCITY
                        </div>
                    </div>
                </div>
                <div className="glass-card p-8 border-l-4 border-blue-500 bg-inspire-blue overflow-hidden relative">
                    <div className="relative z-10">
                        <h4 className="text-slate-100/60 text-sm font-bold uppercase tracking-wider">Consensus Rate</h4>
                        <p className="text-6xl font-black mt-4 outfit text-white">91.5%</p>
                        <p className="text-xs text-blue-300/60 mt-4 font-black uppercase tracking-widest">Multi-Voter Protocols</p>
                    </div>
                </div>
                <div className="glass-card p-8 border-l-4 border-orange-500 bg-inspire-orange overflow-hidden relative">
                    <div className="relative z-10">
                        <h4 className="text-slate-100/60 text-sm font-bold uppercase tracking-wider">Rejection Rate</h4>
                        <p className="text-6xl font-black mt-4 outfit text-white">3.2%</p>
                        <div className="flex items-center gap-1.5 text-xs text-orange-400 mt-4 font-black bg-orange-500/10 w-fit px-2 py-1 rounded-lg">
                            <TrendingDown size={14} /> -1.2% REDUCTION
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold outfit mb-6">Quality Trend Line</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timeSeries}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => new Date(v).toLocaleDateString('en', { day: 'numeric', month: 'short' })} />
                                <YAxis domain={[90, 100]} stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}%`} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} />
                                <Line type="monotone" dataKey="accuracy" stroke={COLORS.success} strokeWidth={4} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold outfit mb-6">Error Category Breakdown</h3>
                    <div className="space-y-6">
                        {[
                            { label: 'Formatting Issues', value: 45, color: 'bg-orange-500' },
                            { label: 'Semantic Mismatch', value: 25, color: 'bg-blue-500' },
                            { label: 'Insufficient Data', value: 15, color: 'bg-purple-500' },
                            { label: 'Other', value: 15, color: 'bg-slate-500' },
                        ].map((err, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between text-sm font-bold">
                                    <span>{err.label}</span>
                                    <span>{err.value}%</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full ${err.color}`} style={{ width: `${err.value}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFinancial = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-8 bg-inspire-green overflow-hidden relative border-green-500/20">
                    <div className="relative z-10">
                        <p className="text-sm text-slate-100/60 font-bold uppercase tracking-wider">Total Utilization</p>
                        <h4 className="text-5xl font-black mt-4 outfit text-white">$18,750.50</h4>
                        <p className="text-xs text-slate-300/50 mt-4 font-black uppercase tracking-widest">Active Pipeline Spend</p>
                    </div>
                </div>
                <div className="glass-card p-8 bg-inspire-blue overflow-hidden relative border-blue-500/20">
                    <div className="relative z-10">
                        <p className="text-sm text-slate-100/60 font-bold uppercase tracking-wider">Avg Unit Cost</p>
                        <h4 className="text-5xl font-black mt-4 outfit text-white">$0.12</h4>
                        <div className="flex items-center gap-1.5 text-xs text-green-400 mt-4 font-black bg-green-500/10 w-fit px-2 py-1 rounded-lg">
                            <ArrowDownRight size={14} /> -5.2% OPTIMIZED
                        </div>
                    </div>
                </div>
                <div className="glass-card p-8 bg-inspire-purple overflow-hidden relative border-purple-500/20">
                    <div className="relative z-10">
                        <p className="text-sm text-slate-100/60 font-bold uppercase tracking-wider">Estimated ROI</p>
                        <h4 className="text-5xl font-black mt-4 outfit text-white">14.2x</h4>
                        <p className="text-xs text-purple-400/80 mt-4 font-black uppercase tracking-widest">Efficiency Multiplier</p>
                    </div>
                </div>
            </div>

            <div className="glass-card p-6">
                <h3 className="text-xl font-bold outfit mb-6 flex items-center gap-2">
                    <DollarSign size={20} className="text-green-500" />
                    Expenditure Over Time
                </h3>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={timeSeries}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => new Date(v).toLocaleDateString('en', { day: 'numeric', month: 'short' })} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${v}`} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} formatter={(v) => [`$${v}`, 'Spent']} />
                            <Bar dataKey="spend" fill="#10b981" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold outfit mb-6">Budget Distribution</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Worker Rewards', value: 75 },
                                        { name: 'Platform Fees', value: 15 },
                                        { name: 'Audit & Review', value: 10 },
                                    ]}
                                    innerRadius={70}
                                    outerRadius={90}
                                    dataKey="value"
                                >
                                    <Cell fill={COLORS.success} />
                                    <Cell fill={COLORS.secondary} />
                                    <Cell fill={COLORS.primary} />
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold outfit mb-6 text-white">Project Financials</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Swahili NLP', spent: 3750, budget: 5000, color: 'bg-green-500' },
                            { name: 'Yoruba Voice', spent: 6500, budget: 6500, color: 'bg-blue-500' },
                            { name: 'East African Landmarks', spent: 384, budget: 3200, color: 'bg-orange-500' },
                        ].map((prj, idx) => (
                            <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold">{prj.name}</span>
                                    <span className="text-xs text-slate-400">${prj.spent.toLocaleString()} / ${prj.budget.toLocaleString()}</span>
                                </div>
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className={`h-full ${prj.color}`} style={{ width: `${(prj.spent / prj.budget) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    if (isLoading && !overview) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
                    <p className="text-slate-400">Syncing Intelligence Matrix...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 px-4 md:px-0">
            {/* Header with Controls */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="w-full lg:w-auto">
                    <h1 className="text-2xl md:text-4xl font-black outfit flex items-center gap-3">
                        <div className="p-2.5 bg-orange-500/10 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.15)] shrink-0">
                            <BarChart3 className="text-orange-500 w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        Dashboard Overview
                    </h1>
                    <p className="text-slate-400 mt-1.5 text-[13px] md:text-base font-medium">Real-time performance and operational status.</p>
                </div>

                <div className="flex flex-wrap gap-3 w-full lg:w-auto mt-4 lg:mt-0">
                    {/* Date Range Dropdown */}
                    <div className="relative flex-1 lg:flex-none min-w-[140px]">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value as DateRange)}
                            className="w-full appearance-none bg-slate-800/80 backdrop-blur-md rounded-xl border border-white/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white cursor-pointer hover:bg-slate-700 transition-all focus:ring-2 focus:ring-orange-500/50"
                        >
                            <option value="7d">Last 7 Days</option>
                            <option value="14d">Last 14 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="90d">Last 90 Days</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <ChevronDown size={14} />
                        </div>
                    </div>

                    <button
                        onClick={fetchAnalytics}
                        className="flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-all active:scale-95 text-white"
                        title="Refresh"
                    >
                        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                        <span className="hidden md:inline">Refresh</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-orange-900/40 hover:bg-orange-500 transition-all translate-y-[-1px] active:scale-95"
                        title="Export Report"
                    >
                        <Download size={14} />
                        <span className="hidden md:inline">Export</span>
                    </button>
                </div>
            </header>

            {/* Tab Navigation - Scrollable on mobile */}
            <div className="overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex gap-2 bg-white/[0.02] p-1 rounded-2xl border border-white/5 min-w-max md:min-w-0">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'workers', label: 'Workforce', icon: Users },
                        { id: 'quality', label: 'Quality', icon: Target },
                        { id: 'financial', label: 'Financial', icon: DollarSign }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-white/5 text-orange-500 border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.1)]'
                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* View Dispatcher */}
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'workers' && renderWorkforce()}
            {activeTab === 'quality' && renderQuality()}
            {activeTab === 'financial' && renderFinancial()}
        </div>
    );
}

// ============================================
// Sub-components
// ============================================

function KPICard({ label, value, subValue, icon, trend, invertTrend = false }: {
    label: string;
    value: string;
    subValue: string;
    icon: React.ReactNode;
    trend?: { changePercent: number; trend: 'up' | 'down' | 'stable' } | null;
    invertTrend?: boolean;
}) {
    const getTrendColor = () => {
        if (!trend) return 'text-slate-400';
        const isPositive = invertTrend ? trend.trend === 'down' : trend.trend === 'up';
        return isPositive ? 'text-green-500' : trend.trend === 'stable' ? 'text-slate-400' : 'text-red-500';
    };

    const TrendIcon = trend?.trend === 'up' ? TrendingUp : trend?.trend === 'down' ? TrendingDown : Activity;

    return (
        <div className="glass-card p-5 hover:border-orange-500/30 transition-all group">
            <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-white/10 transition-all">
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${getTrendColor()}`}>
                        <TrendIcon size={12} />
                        {Math.abs(trend.changePercent)}%
                    </div>
                )}
            </div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
            <h4 className="text-2xl font-bold outfit mt-1">{value}</h4>
            <p className="text-[10px] text-slate-500 mt-1">{subValue}</p>
        </div>
    );
}

function LegendItem({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-slate-400">{label}</span>
            </div>
            <span className="font-bold">{value}</span>
        </div>
    );
}

function WorkerCard({ worker, rank }: { worker: WorkerMetrics; rank: number }) {
    return (
        <div className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-white/5 hover:border-orange-500/30 group">
            <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                    <img
                        src={worker.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.fullName}`}
                        alt={worker.fullName}
                        className="w-10 h-10 rounded-full bg-slate-700"
                    />
                    {rank <= 3 && (
                        <span className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black ${rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-slate-400' : 'bg-amber-700'
                            } text-white`}>
                            {rank}
                        </span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-sm truncate group-hover:text-orange-500 transition-colors">{worker.fullName}</h5>
                    <p className="text-[10px] text-slate-500">{worker.location}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-800/50 rounded-lg p-2">
                    <p className="text-lg font-bold text-green-500">{worker.accuracyRate.toFixed(1)}%</p>
                    <p className="text-[10px] text-slate-500">Accuracy</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2">
                    <p className="text-lg font-bold">{worker.totalSubmissions.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500">Tasks</p>
                </div>
            </div>
        </div>
    );
}

function InsightCard({ title, value, description, trend }: {
    title: string;
    value: string;
    description: string;
    trend: 'up' | 'down' | 'stable';
}) {
    return (
        <div className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-white/5">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs text-slate-400 font-medium">{title}</p>
                    <p className="text-lg font-bold mt-1">{value}</p>
                    <p className="text-[10px] text-slate-500">{description}</p>
                </div>
                <div className={`p-1.5 rounded-lg ${trend === 'up' ? 'bg-green-500/10 text-green-500' : trend === 'down' ? 'bg-red-500/10 text-red-500' : 'bg-slate-500/10 text-slate-500'
                    }`}>
                    {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </div>
            </div>
        </div>
    );
}

function NavCard({ title, desc, icon, onClick, stats, pattern = "" }: {
    title: string;
    desc: string;
    icon: React.ReactNode;
    onClick: () => void;
    stats: string;
    pattern?: string;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col text-left p-4 md:p-6 glass-card border-white/10 hover:border-orange-500/30 transition-all group active:scale-[0.96] overflow-hidden relative min-h-[140px] md:min-h-[220px] ${pattern}`}
        >
            {/* Notification Badge - Black 900 Stat */}
            <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20">
                <div className="flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/20 group-hover:bg-orange-500/40 transition-all">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                    <span className="text-[10px] md:text-sm font-black uppercase tracking-wider text-white">
                        {stats.split(' ')[0]}
                    </span>
                </div>
            </div>

            <div className="relative z-10 w-full h-full flex flex-col">
                {/* Horizontal Header: Thumb-Driven Logic */}
                <div className="flex items-start gap-3 md:flex-col md:items-start md:gap-0">
                    <div className="p-2 md:p-3 bg-white/10 rounded-xl w-fit mb-0 md:mb-5 border border-white/5 shrink-0 shadow-lg shadow-black/20">
                        <div className="scale-90 md:scale-110">
                            {icon}
                        </div>
                    </div>

                    <div className="flex-1">
                        <h4 className="font-bold text-white text-[14px] md:text-xl lg:text-2xl tracking-tight outfit group-hover:text-orange-500 transition-colors leading-tight line-clamp-2">
                            {title}
                        </h4>
                    </div>
                </div>

                {/* Description - Medium 500 visibility */}
                <p className="text-[12px] md:text-sm text-white/80 mt-2 md:mt-2 font-medium leading-relaxed flex-1 group-hover:text-white transition-colors line-clamp-2">
                    {desc}
                </p>
            </div>
        </button>
    );
}
