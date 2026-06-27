'use client';
import { useMemo, useState } from 'react';
import type { SpinRecord } from '../lib/types';

interface MultiplierHeatmapProps {
    data: SpinRecord[] | undefined;
}

export default function MultiplierHeatmap({ data }: MultiplierHeatmapProps) {
    const [timeframe, setTimeframe] = useState<number>(100);

    const heatmapData = useMemo(() => {
        if (!data || data.length === 0) return [];

        const recentData = timeframe > 0 ? data.slice(0, timeframe) : data;
        
        const segmentStats: Record<string, { count: number, sum: number, max: number }> = {};
        
        recentData.forEach(spin => {
            const seg = spin.result;
            if (!segmentStats[seg]) {
                segmentStats[seg] = { count: 0, sum: 0, max: 0 };
            }
            segmentStats[seg].count++;
            segmentStats[seg].sum += spin.finalMultiplier;
            if (spin.finalMultiplier > segmentStats[seg].max) {
                segmentStats[seg].max = spin.finalMultiplier;
            }
        });

        const segments = ['1', '2', '5', '10', 'Coin Flip', 'Pachinko', 'Cash Hunt', 'Crazy Time'];
        
        return segments.map(seg => {
            const stats = segmentStats[seg];
            if (!stats) return { segment: seg, count: 0, avg: 0, max: 0, intensity: 0 };
            
            const avg = stats.sum / stats.count;
            const intensity = Math.min(avg / 10, 1);
            
            return {
                segment: seg,
                count: stats.count,
                avg,
                max: stats.max,
                intensity
            };
        });
    }, [data, timeframe]);

    if (!data || data.length === 0) return null;

    return (
        <div className="w-full bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Multiplier Heatmap</h3>
                <select 
                    value={timeframe} 
                    onChange={(e) => setTimeframe(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 text-sm font-medium text-slate-200 rounded-lg px-3 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                    <option value={50}>Last 50 spins</option>
                    <option value={100}>Last 100 spins</option>
                    <option value={500}>Last 500 spins</option>
                    <option value={0}>All time</option>
                </select>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {heatmapData.map(item => (
                    <div 
                        key={item.segment} 
                        className="rounded-xl p-4 border border-slate-700/50 relative overflow-hidden"
                        style={{
                            backgroundColor: `rgba(59, 130, 246, ${item.intensity * 0.4})`
                        }}
                    >
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <span className="text-sm font-bold text-slate-300 mb-1">{item.segment}</span>
                            <span className="text-3xl font-black text-white">{item.avg > 0 ? item.avg.toFixed(1) : '-'}x</span>
                            <div className="flex justify-between w-full mt-3 text-[10px] uppercase font-bold text-slate-400">
                                <span>Hits: {item.count}</span>
                                <span>Max: {item.max > 0 ? `${item.max}x` : '-'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
