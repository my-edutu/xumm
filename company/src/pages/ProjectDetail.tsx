import React, { useState } from 'react';
import TaskBuilder from './TaskBuilder';
import {
    ArrowLeft,
    Download,
    Settings,
    Upload,
    Plus,
    Users,
    Target,
    ShieldCheck,
    FileJson,
    FileSpreadsheet,
    MoreVertical,
    Play,
    Pause,
    Clock
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const taskData = [
    { name: '08:00', approvals: 45, rejections: 5 },
    { name: '10:00', approvals: 52, rejections: 8 },
    { name: '12:00', approvals: 61, rejections: 10 },
    { name: '14:00', approvals: 55, rejections: 12 },
    { name: '16:00', approvals: 67, rejections: 15 },
    { name: '18:00', approvals: 72, rejections: 8 },
    { name: '20:00', approvals: 65, rejections: 5 },
];

interface ProjectDetailProps {
    project: {
        id: string;
        name: string;
        status: string;
        progress: number;
        cost: string;
    };
    onBack: () => void;
}

export default function ProjectDetail({ project, onBack }: ProjectDetailProps) {
    const [activeTab, setActiveTab] = useState('tasks');
    const [showTaskBuilder, setShowTaskBuilder] = useState(false);

    if (showTaskBuilder) {
        return (
            <TaskBuilder
                projectId={project.id}
                onBack={() => setShowTaskBuilder(false)}
                onSave={() => setShowTaskBuilder(false)}
            />
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold outfit">{project.name}</h1>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${project.status === 'Active' ? 'bg-green-500/20 text-green-500' :
                                project.status === 'Paused' ? 'bg-yellow-500/20 text-yellow-500' :
                                    'bg-blue-500/20 text-blue-500'
                                }`}>
                                {project.status}
                            </span>
                        </div>
                        <p className="text-slate-400 mt-1">Project ID: {project.id}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                        <Download size={18} />
                        <span>Export Data</span>
                    </button>
                    <button
                        onClick={() => setShowTaskBuilder(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-900/20"
                    >
                        <Plus size={18} />
                        Add Tasks
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-xl text-slate-400">
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                {/* Project Health Stats */}
                <DetailStatCard title="Submissions" value="12,450" subValue="/ 15,000" icon={<Users className="text-blue-500" />} color="blue" />
                <DetailStatCard title="Accuracy Rate" value="98.2%" subValue="+0.4% target" icon={<Target className="text-green-500" />} color="green" />
                <DetailStatCard title="Consensus" value="3/5" subValue="Validators" icon={<ShieldCheck className="text-orange-500" />} color="orange" />
                <DetailStatCard title="Budget Spent" value={project.cost} subValue="/ $5,000" icon={<Clock className="text-purple-500" />} color="purple" />
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5 mb-8 overflow-x-auto no-scrollbar">
                <TabItem label="Tasks Overview" active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
                <TabItem label="Submission Queue" active={activeTab === 'queue'} onClick={() => setActiveTab('queue')} />
                <TabItem label="Demographics" active={activeTab === 'demo'} onClick={() => setActiveTab('demo')} />
                <TabItem label="Quality Control" active={activeTab === 'qc'} onClick={() => setActiveTab('qc')} />
                <TabItem label="Export History" active={activeTab === 'exports'} onClick={() => setActiveTab('exports')} />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Performance Chart */}
                    <div className="glass-card p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold outfit">Hourly Throughput</h3>
                            <div className="flex gap-4 text-xs">
                                <div className="flex items-center gap-1.5 text-green-400">
                                    <div className="w-2 h-2 rounded-full bg-green-400" /> Approvals
                                </div>
                                <div className="flex items-center gap-1.5 text-red-400">
                                    <div className="w-2 h-2 rounded-full bg-red-400" /> Rejections
                                </div>
                            </div>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={taskData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    />
                                    <Line type="monotone" dataKey="approvals" stroke="#10b981" strokeWidth={3} dot={false} />
                                    <Line type="monotone" dataKey="rejections" stroke="#ef4444" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Task List */}
                    <div className="glass-card overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-xl font-bold outfit">Active Task Sets</h3>
                            <button className="text-orange-500 text-sm font-semibold hover:underline">Manage All</button>
                        </div>
                        <div className="divide-y divide-white/5">
                            <TaskItem
                                name="Greeting Clips (Yoruba)"
                                type="Audio Recording"
                                progress={82}
                                completed="820"
                                total="1000"
                                status="Active"
                            />
                            <TaskItem
                                name="Slang Transcription"
                                type="Text Annotation"
                                progress={45}
                                completed="450"
                                total="1000"
                                status="Paused"
                            />
                            <TaskItem
                                name="Cultural Sentiment"
                                type="RLHF"
                                progress={15}
                                completed="150"
                                total="1000"
                                status="Active"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h3 className="font-bold outfit mb-4 text-lg">Project Actions</h3>
                        <div className="space-y-3">
                            <ActionButton icon={<Pause size={18} />} label="Pause Project" />
                            <ActionButton icon={<Plus size={18} />} label="Scale Inventory" primary />
                            <ActionButton icon={<Upload size={18} />} label="Upload Add-on Data" />
                        </div>
                    </div>

                    <div className="glass-card p-6 bg-orange-500/5 border-orange-500/10">
                        <div className="flex items-center gap-2 text-orange-500 mb-3">
                            <Clock size={18} />
                            <span className="font-bold text-sm uppercase tracking-wider outfit">Quick Insights</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed mb-4">
                            92% of rejections are coming from new workers (Level 1). Consider raising the
                            <strong> Minimum Trust Score</strong> to 8.5 to improve data quality.
                        </p>
                        <button className="text-orange-500 text-sm font-bold hover:underline">Apply Quality Filter →</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailStatCard({ title, value, subValue, icon, color }: any) {
    const colorMap: any = {
        blue: 'bg-blue-500/10 text-blue-500',
        green: 'bg-green-500/10 text-green-500',
        orange: 'bg-orange-500/10 text-orange-500',
        purple: 'bg-purple-500/10 text-purple-500',
    };

    return (
        <div className="glass-card p-5 relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-20 h-20 opacity-10 blur-2xl rounded-full ${colorMap[color].split(' ')[0]}`} />
            <div className="flex items-center gap-4 mb-3">
                <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>
                    {React.cloneElement(icon, { size: 20 })}
                </div>
                <h4 className="text-slate-400 text-sm font-medium">{title}</h4>
            </div>
            <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-white outfit tracking-tight">{value}</span>
                <span className="text-sm text-slate-500 font-medium">{subValue}</span>
            </div>
        </div>
    );
}

function TabItem({ label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-4 text-sm font-medium transition-all relative min-w-fit ${active
                ? 'text-orange-500'
                : 'text-slate-400 hover:text-slate-200'
                }`}
        >
            {label}
            {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />}
        </button>
    );
}

function TaskItem({ name, type, progress, completed, total, status }: any) {
    return (
        <div className="p-6 hover:bg-white/5 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-bold text-lg group-hover:text-orange-500 transition-colors">{name}</h4>
                    <p className="text-sm text-slate-400">{type}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-bold border-white">{completed} <span className="text-slate-500">/ {total}</span></p>
                        <p className="text-xs text-slate-500">Submissions</p>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400">
                        <MoreVertical size={18} />
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ${status === 'Paused' ? 'bg-slate-600' : 'bg-orange-500'
                            }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="text-sm font-bold text-slate-400">{progress}%</span>
            </div>
        </div>
    );
}

function ActionButton({ icon, label, primary = false }: any) {
    return (
        <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${primary
            ? 'bg-orange-600 text-white hover:bg-orange-500 shadow-lg shadow-orange-900/20'
            : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}>
            {icon}
            <span>{label}</span>
        </button>
    );
}
