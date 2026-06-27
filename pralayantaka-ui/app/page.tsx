'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileEdit, LineChart, Database, UserCog } from 'lucide-react';
import { api } from '../lib/api';
import type { SpinRecord } from '../lib/types';
import SpinForm from '../components/SpinForm';
import FrequencyChart from '../components/FrequencyChart';
import ProbabilityDashboard from '../components/ProbabilityDashboard';
import StreakTracker from '../components/StreakTracker';
import SpinHistoryTable from '../components/SpinHistoryTable';
import TopSlotAnalysis from '../components/TopSlotAnalysis';
import BonusGameStats from '../components/BonusGameStats';
import MultiplierHeatmap from '../components/MultiplierHeatmap';
import SessionManager from '../components/SessionManager';
import HotColdTracker from '../components/HotColdTracker';
import PayoutMomentumChart from '../components/PayoutMomentumChart';

export default function Home() {
    const [activeTab, setActiveTab] = useState<'Entry' | 'Analytics' | 'Database'>('Entry');

    const { data, isLoading, isError, isFetching } = useQuery<SpinRecord[]>({
        queryKey: ['spins'],
        queryFn: async () => (await api.get('/spins')).data,
        refetchInterval: 2000,
    });

    // Only show full page spinner on initial load when there's no data.
    const isInitialLoading = isLoading && !data;

    return (
        <div className="flex h-screen bg-[#0F111A] text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden">
            
            {/* SIDEBAR NAVIGATION */}
            <aside className="w-64 bg-[#161824] border-r border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex z-10 shadow-2xl">
                <div className="p-6">
                    <h1 className="text-2xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-amber-600 font-['Cinzel'] text-center drop-shadow-md mb-2">
                        PRALAYANTAKA
                    </h1>
                    <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-10">
                        The Engine of Time
                    </p>

                    <nav className="space-y-2">
                        <button 
                            onClick={() => setActiveTab('Entry')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                                activeTab === 'Entry' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                            }`}
                        >
                            <FileEdit className="w-5 h-5" /> Spin Entry
                        </button>
                        <button 
                            onClick={() => setActiveTab('Analytics')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                                activeTab === 'Analytics' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                            }`}
                        >
                            <LineChart className="w-5 h-5" /> Market Intelligence
                        </button>
                        <button 
                            onClick={() => setActiveTab('Database')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                                activeTab === 'Database' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                            }`}
                        >
                            <Database className="w-5 h-5" /> Raw Database
                        </button>
                    </nav>
                </div>
                
                <div className="p-6 border-t border-slate-800/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                            <UserCog className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white">Admin Access</p>
                            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Connected
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 h-screen overflow-y-auto relative">
                {/* Background ambient glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
                
                <div className="max-w-7xl mx-auto p-6 md:p-10">
                    
                    {/* Mobile Header */}
                    <div className="md:hidden flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                        <h1 className="text-xl font-bold font-['Cinzel'] text-yellow-500">PRALAYANTAKA</h1>
                        <select 
                            value={activeTab} 
                            onChange={(e) => setActiveTab(e.target.value as any)}
                            className="bg-slate-800 text-sm border-none rounded-lg py-2 px-4 outline-none font-bold text-white"
                        >
                            <option value="Entry">Spin Entry</option>
                            <option value="Analytics">Intelligence</option>
                            <option value="Database">Database</option>
                        </select>
                    </div>

                    {/* Network Status Indicator */}
                    {isError && (
                        <div className="mb-6 p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 text-sm font-bold flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            Live Feed Disconnected. Retrying...
                        </div>
                    )}

                    {isInitialLoading ? (
                        <div className="flex justify-center py-32">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            
                            {/* SHEET 1: SPIN ENTRY */}
                            {activeTab === 'Entry' && (
                                <div className="space-y-10">
                                    <div className="text-center pb-6 border-b border-slate-800/50">
                                        <h1 className="font-['Cinzel'] text-4xl md:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-600 drop-shadow-xl mb-3">
                                            PRALAYANTAKA'S EXPERIMENT
                                        </h1>
                                        <p className="text-slate-400 tracking-[0.2em] font-medium text-sm">DECONSTRUCTING THE ILLUSION OF TIME</p>
                                    </div>
                                    
                                    <div className="max-w-5xl mx-auto">
                                        <SpinForm />
                                    </div>

                                    {/* Show a mini dashboard of streaks under entry to give context */}
                                    {data && data.length > 0 && (
                                        <div className="mt-12 pt-8 border-t border-slate-800/50">
                                            <h2 className="text-xl font-bold text-white mb-6 font-['Cinzel'] text-center">Current Cosmic Timelines</h2>
                                            <StreakTracker data={data} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* SHEET 2: ANALYTICS DASHBOARD */}
                            {activeTab === 'Analytics' && data && data.length > 0 && (
                                <div className="space-y-8">
                                    <div className="mb-8">
                                        <h2 className="text-3xl font-['Cinzel'] font-bold text-white">Market Intelligence</h2>
                                        <p className="text-slate-400 mt-2">Deep dive into historical probability and momentum.</p>
                                    </div>

                                    {/* High level KPIs */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-center shadow-lg">
                                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Total Logged</div>
                                            <div className="text-4xl font-black text-white">{data.length} <span className="text-lg text-slate-500">spins</span></div>
                                        </div>
                                        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-blue-500/10 scale-0 group-hover:scale-150 transition-transform duration-500 rounded-full"></div>
                                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Avg Payout/Player</div>
                                            <div className="text-4xl font-black text-blue-400 relative z-10">
                                                ${(data.reduce((acc, curr) => acc + (curr.numberOfPlayers > 0 ? curr.totalWinningAmount/curr.numberOfPlayers : 0), 0) / data.length).toFixed(2)}
                                            </div>
                                        </div>
                                        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-center shadow-lg">
                                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Highest Multiplier</div>
                                            <div className="text-4xl font-black text-yellow-400">{Math.max(...data.map(d => d.finalMultiplier))}x</div>
                                        </div>
                                    </div>

                                    {/* Momentum & Expected vs Actual */}
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                        <PayoutMomentumChart spins={data} />
                                        <ProbabilityDashboard data={data} />
                                    </div>

                                    {/* Hot/Cold Tracking - Full Width */}
                                    <HotColdTracker spins={data} />

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <TopSlotAnalysis data={data} />
                                        <BonusGameStats data={data} />
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <MultiplierHeatmap data={data} />
                                        <FrequencyChart data={data} />
                                    </div>
                                </div>
                            )}

                            {/* SHEET 3: DATABASE */}
                            {activeTab === 'Database' && data && (
                                <div className="space-y-6">
                                    <div className="mb-8">
                                        <h2 className="text-3xl font-['Cinzel'] font-bold text-white">Raw Database Records</h2>
                                        <p className="text-slate-400 mt-2">Export, manage, and audit your historical session data.</p>
                                    </div>
                                    <SessionManager data={data} />
                                    <SpinHistoryTable data={data} />
                                </div>
                            )}

                            {/* EMPTY STATE */}
                            {activeTab !== 'Entry' && (!data || data.length === 0) && (
                                <div className="flex flex-col items-center justify-center py-32 text-center">
                                    <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6">
                                        <span className="text-4xl">🕳️</span>
                                    </div>
                                    <h2 className="font-['Cinzel'] text-2xl font-bold text-white mb-2">The Void is Empty</h2>
                                    <p className="text-slate-400 max-w-md">There is no market data to analyze yet. Please head to the Spin Entry sheet and log your first outcome.</p>
                                    <button 
                                        onClick={() => setActiveTab('Entry')}
                                        className="mt-8 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-500/20"
                                    >
                                        Start Logging
                                    </button>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}