'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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

function formatTimestamp(ts: string): string {
    const date = new Date(ts);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        + ' · '
        + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Home() {
    const [activeTab, setActiveTab] = useState<'Live' | 'Analytics' | 'History'>('Live');

    const { data, isLoading } = useQuery<SpinRecord[]>({
        queryKey: ['spins'],
        queryFn: async () => (await api.get('/spins')).data,
        refetchInterval: 2000,
    });

    return (
        <main className="min-h-screen bg-[#0B0F19] text-slate-200 p-4 md:p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Premium Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800 pb-6 gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                                Pralayantaka
                            </span> Analytics
                        </h1>
                        <p className="text-slate-400 mt-2 font-medium">Real-time engagement and probability tracking</p>
                    </div>
                    
                    <div className="flex gap-1 bg-slate-900/50 p-1.5 rounded-xl border border-slate-700/50 self-start md:self-auto">
                        <button 
                            onClick={() => setActiveTab('Live')}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'Live' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                        >
                            Live Feed
                        </button>
                        <button 
                            onClick={() => setActiveTab('Analytics')}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'Analytics' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                        >
                            Analytics Dashboard
                        </button>
                        <button 
                            onClick={() => setActiveTab('History')}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'History' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                        >
                            History & Export
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="min-h-[500px]">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : !data || data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                                <span className="text-3xl">🎡</span>
                            </div>
                            <p className="text-slate-400 font-semibold text-lg">No spins recorded yet</p>
                            <p className="text-slate-500 text-sm mt-1">Use the form below to log your first Crazy Time round</p>
                            <div className="mt-12 w-full max-w-4xl mx-auto text-left">
                                <SpinForm />
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* LIVE FEED TAB */}
                            {activeTab === 'Live' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="lg:col-span-2 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-2xl font-bold text-white">Recent Outcomes</h2>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-slate-500">Total Spins:</span>
                                                        <span className="font-bold text-white">{data.length}</span>
                                                    </div>
                                                    <span className="text-xs font-semibold px-3 py-1 bg-slate-800/80 rounded-full text-green-400 border border-green-400/20 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                                        Live Sync
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                {data.slice(0, 10).map((spin) => (
                                                    <div key={spin.id} className="relative group bg-slate-800/40 hover:bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(79,70,229,0.15)] hover:-translate-y-1 overflow-hidden">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-blue-500/20"></div>

                                                        <div className="flex justify-between items-start mb-4">
                                                            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                                                                {spin.gameType}
                                                            </span>
                                                            <span className="px-2 py-1 text-[10px] font-bold rounded bg-slate-900 border border-slate-700 text-slate-500">
                                                                #{spin.id}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-6xl font-black text-white tracking-tighter drop-shadow-md">
                                                                {spin.finalMultiplier}
                                                            </span>
                                                            <span className="text-2xl font-bold text-blue-400">x</span>
                                                        </div>

                                                        <div className="mt-4 pt-3 border-t border-slate-700/50 space-y-2">
                                                            <div className="flex justify-between items-center text-sm font-medium">
                                                                <span className="text-slate-500">Segment</span>
                                                                <span className="text-slate-300 font-bold">{spin.result}</span>
                                                            </div>
                                                            {spin.topSlotSegment && (
                                                                <div className="flex justify-between items-center text-sm font-medium">
                                                                    <span className="text-yellow-500/70">Top Slot</span>
                                                                    <span className="text-yellow-400 font-bold">{spin.topSlotSegment} @ {spin.topSlotMultiplier}x</span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between items-center text-xs">
                                                                <span className="text-slate-600">{formatTimestamp(spin.timestamp)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                                <span className="text-xl">⚙️</span> Controller
                                            </h2>
                                            <SpinForm />
                                            <div className="mt-8">
                                                <StreakTracker data={data} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ANALYTICS TAB */}
                            {activeTab === 'Analytics' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <ProbabilityDashboard data={data} />
                                        <FrequencyChart data={data} />
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <TopSlotAnalysis data={data} />
                                        <BonusGameStats data={data} />
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <MultiplierHeatmap data={data} />
                                        <SessionManager data={data} />
                                    </div>
                                </div>
                            )}

                            {/* HISTORY TAB */}
                            {activeTab === 'History' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <SpinHistoryTable data={data} />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}