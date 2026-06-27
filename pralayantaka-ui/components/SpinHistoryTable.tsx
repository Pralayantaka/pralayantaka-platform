'use client';
import { useState, useMemo } from 'react';
import type { SpinRecord } from '../lib/types';

interface SpinHistoryTableProps {
    data: SpinRecord[] | undefined;
}

export default function SpinHistoryTable({ data }: SpinHistoryTableProps) {
    const [filter, setFilter] = useState<string>('All');
    
    const filteredData = useMemo(() => {
        if (!data) return [];
        if (filter === 'All') return data;
        if (filter === 'Bonus') return data.filter(s => ['Coin Flip', 'Pachinko', 'Cash Hunt', 'Crazy Time'].includes(s.result));
        return data.filter(s => s.result === filter);
    }, [data, filter]);

    const handleExportCSV = () => {
        if (!filteredData || filteredData.length === 0) return;
        
        const headers = ['ID', 'Timestamp', 'Segment', 'Top Slot', 'Top Slot Multiplier', 'Final Multiplier', 'Game Specific JSON'];
        const csvRows = [headers.join(',')];
        
        filteredData.forEach(spin => {
            const row = [
                spin.id,
                spin.timestamp,
                spin.result,
                spin.topSlotSegment || 'None',
                spin.topSlotMultiplier || '',
                spin.finalMultiplier,
                spin.gameSpecificData ? `"${spin.gameSpecificData.replace(/"/g, '""')}"` : ''
            ];
            csvRows.push(row.join(','));
        });
        
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pralayantaka_spins_${new Date().getTime()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (!data || data.length === 0) return null;

    return (
        <div className="w-full bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl flex flex-col h-[600px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Spin History Log</h3>
                
                <div className="flex gap-4">
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-sm font-medium text-slate-200 rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        <option value="All">All Spins</option>
                        <option value="Bonus">All Bonus Games</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="5">5</option>
                        <option value="10">10</option>
                    </select>
                    
                    <button 
                        onClick={handleExportCSV}
                        className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 font-bold text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                        ⬇ Export CSV
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-auto rounded-xl border border-slate-700/50 bg-slate-900/50">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="text-xs uppercase bg-slate-800/80 text-slate-300 sticky top-0 backdrop-blur-md z-10 shadow-md">
                        <tr>
                            <th scope="col" className="px-4 py-3 rounded-tl-xl">ID</th>
                            <th scope="col" className="px-4 py-3">Time</th>
                            <th scope="col" className="px-4 py-3">Segment</th>
                            <th scope="col" className="px-4 py-3">Top Slot</th>
                            <th scope="col" className="px-4 py-3 text-right">Multiplier</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {filteredData.map(spin => (
                            <tr key={spin.id} className="hover:bg-slate-800/40 transition-colors group">
                                <td className="px-4 py-3 font-mono text-slate-500">#{spin.id}</td>
                                <td className="px-4 py-3">{new Date(spin.timestamp).toLocaleTimeString()}</td>
                                <td className="px-4 py-3 font-bold text-slate-200">
                                    <span className={['Coin Flip', 'Pachinko', 'Cash Hunt', 'Crazy Time'].includes(spin.result) ? 'text-amber-400' : ''}>
                                        {spin.result}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {spin.topSlotSegment ? (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-500/90 font-semibold text-xs border border-yellow-500/20">
                                            {spin.topSlotSegment} <span className="text-yellow-400 ml-1">{spin.topSlotMultiplier}x</span>
                                        </span>
                                    ) : (
                                        <span className="text-slate-600">-</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right font-black text-white text-base">
                                    {spin.finalMultiplier}x
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredData.length === 0 && (
                    <div className="text-center py-12 text-slate-500">No spins match the selected filter.</div>
                )}
            </div>
        </div>
    );
}
