import React, { useState, useEffect } from 'react';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    CreditCard,
    Plus,
    Download,
    ShieldCheck,
    History,
    AlertCircle,
    ExternalLink,
    Loader2
} from 'lucide-react';
import { billingService, WalletInfo, Transaction } from '../services/billingService';

export default function Billing() {
    const [wallet, setWallet] = useState<WalletInfo | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState('500');
    const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'paystack'>('stripe');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [w, t] = await Promise.all([
            billingService.getWallet(),
            billingService.getTransactions()
        ]);
        setWallet(w);
        setTransactions(t);
        setLoading(false);
    };

    const handleDeposit = async () => {
        setProcessing(true);
        try {
            const res = await billingService.initiateDeposit(Number(amount), selectedMethod);
            alert('Deposit request created! In a production environment, you would now be redirected to the payment gateway. For now, an admin will process this in the ledger.');
            loadData();
        } catch (e) {
            alert('Deposit failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
                <p className="text-slate-400 font-medium outfit uppercase tracking-widest">Synchronizing Treasury...</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold outfit text-white">Billing & Payments</h1>
                    <p className="text-slate-400 mt-1">Manage your balance and transaction history.</p>
                </div>
            </header>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6 border-orange-500/20 bg-orange-500/5 relative overflow-hidden group col-span-1 md:col-span-2">
                    <div className="absolute -right-4 -bottom-4 text-orange-500/5 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                        <Wallet size={120} />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-500 rounded-xl text-white shadow-lg shadow-orange-900/40">
                            <Wallet size={24} />
                        </div>
                        <span className="text-xs font-bold text-orange-500 px-2 py-1 bg-orange-500/10 rounded-full uppercase tracking-wider">Active</span>
                    </div>
                    <h3 className="text-slate-400 text-sm font-medium">Available Balance</h3>
                    <p className="text-4xl md:text-5xl font-bold mt-1 outfit text-white">${wallet?.available_balance.toLocaleString() || '0.00'}</p>
                </div>



                <div className="glass-card p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-slate-800 rounded-xl text-slate-400">
                            <History size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-500 px-2 py-1 bg-white/5 rounded-full uppercase tracking-wider">Activity</span>
                    </div>
                    <h3 className="text-slate-400 text-sm font-medium">Total Spend</h3>
                    <p className="text-4xl font-bold mt-1 outfit">${wallet?.total_spent.toLocaleString() || '0.00'}</p>
                    <div className="mt-4 flex items-center gap-2 text-emerald-500 text-sm font-bold">
                        <ArrowUpRight size={16} /> Account Status: Good
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Transaction History Only */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <h3 className="text-xl font-bold outfit text-white">Transactions</h3>
                            <button className="text-[10px] font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl text-slate-400 hover:text-white flex items-center gap-1 transition-all border border-white/5">
                                Export CSV <Download size={14} />
                            </button>
                        </div>
                        <div className="divide-y divide-white/5 bg-[#020617]/50">
                            {transactions.length === 0 ? (
                                <div className="p-20 text-center opacity-30">
                                    <History size={48} className="mx-auto mb-4" />
                                    <p className="text-sm font-bold uppercase tracking-widest">No transaction records found</p>
                                </div>
                            ) : (
                                transactions.map(t => (
                                    <TransactionItem
                                        key={t.id}
                                        title={`${t.type.replace(/_/g, ' ').toUpperCase()}`}
                                        date={new Date(t.created_at).toLocaleDateString()}
                                        amount={`${t.amount > 0 ? '+' : ''} $${Math.abs(t.amount).toLocaleString()}`}
                                        type={t.amount > 0 ? 'in' : 'out'}
                                        status="Completed"
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">


                    <div className="glass-card p-6 border-white/5">
                        <h4 className="font-bold outfit mb-4 flex items-center gap-2 text-white">
                            Contact Us
                        </h4>
                        <div className="space-y-4 mb-6">
                            <p className="text-xs text-slate-400 leading-relaxed">Need help with your billing or have a discrepancy? Our team is ready to help you.</p>
                        </div>
                        <button className="w-full py-3 bg-orange-600 hover:bg-orange-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-white shadow-lg shadow-orange-950/40">
                            Support Ticket
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PaymentMethod({ icon, title, desc, active = false, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${active ? 'border-orange-500 bg-orange-500/10' : 'border-white/5 bg-white/5 hover:border-white/10'
                }`}>
            <div className={`text-2xl p-2 rounded-lg ${active ? 'bg-orange-500 text-white' : 'bg-white/5'}`}>{icon}</div>
            <div>
                <h5 className={`font-bold text-sm ${active ? 'text-white' : 'text-slate-400'}`}>{title}</h5>
                <p className="text-[10px] text-slate-500 font-medium">{desc}</p>
            </div>
        </div>
    );
}

function TransactionItem({ title, date, amount, type, status }: any) {
    return (
        <div className="p-5 flex justify-between items-center hover:bg-white/5 transition-all group">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${type === 'in' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-400'
                    }`}>
                    {type === 'in' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div>
                    <h5 className="font-bold text-base group-hover:text-orange-500 transition-colors text-white">{title}</h5>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{date} • {status}</p>
                </div>
            </div>
            <span className={`text-xl font-black outfit ${type === 'in' ? 'text-emerald-500' : 'text-slate-100'}`}>
                {amount}
            </span>
        </div>
    );
}

