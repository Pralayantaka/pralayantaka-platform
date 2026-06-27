'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api'; // Updated path
import SpinForm from '../components/SpinForm'; // Updated path


interface SpinRecord {
    id: number;
    gameType: string;
    result: string;
    finalMultiplier: number;
    timestamp: string;
}

export default function Home() {
    const { data, isLoading } = useQuery<SpinRecord[]>({
        queryKey: ['spins'],
        queryFn: async () => (await api.get('/spins')).data,
        refetchInterval: 2000,
    });

    return (
        <main className="min-h-screen bg-[#0B0F19] text-slate-200 p-6 md:p-12 font-sans selection:bg-blue-500/30">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Premium Header */}
                <header className="flex items-center justify-between border-b border-slate-800 pb-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                                Pralayantaka
                            </span> Analytics
                        </h1>
                        <p className="text-slate-400 mt-2 font-medium">Real-time engagement and probability tracking</p>
                    </div>
                </header>

                {/* Input Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-300 flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                        Live Data Feed Override
                    </h2>
                    <SpinForm />
                </section>

                {/* Data Grid Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">Recent Outcomes</h2>
                        <span className="text-xs font-semibold px-3 py-1 bg-slate-800/80 rounded-full text-green-400 border border-green-400/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]">
                            ● Live Sync Active
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data?.map((spin) => (
                                <div key={spin.id} className="relative group bg-slate-800/40 hover:bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(79,70,229,0.15)] hover:-translate-y-1 overflow-hidden">

                                    {/* Ambient Glow Effect on Hover */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-blue-500/20"></div>

                                    <div className="flex justify-between items-start mb-6">
                                        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                                            {spin.gameType}
                                        </span>
                                        <span className="px-2 py-1 text-[10px] font-bold rounded bg-slate-900 border border-slate-700 text-slate-500">
                                            ID: {spin.id}
                                        </span>
                                    </div>

                                    <div className="flex items-baseline gap-1">
                                        <span className="text-6xl font-black text-white tracking-tighter drop-shadow-md">
                                            {spin.finalMultiplier}
                                        </span>
                                        <span className="text-2xl font-bold text-blue-400">x</span>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center text-sm font-medium">
                                        <span className="text-slate-500">Segment</span>
                                        <span className="text-slate-300">{spin.result}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}