'use client';
import { useMemo } from 'react';
import type { SpinRecord } from '../lib/types';

interface TopSlotAnalysisProps {
    data: SpinRecord[] | undefined;
}

export default function TopSlotAnalysis({ data }: TopSlotAnalysisProps) {
    const stats = useMemo(() => {
        if (!data || data.length === 0) return null;

        const totalSpins = data.length;
        let activeCount = 0;
        let hitCount = 0;
        let sumMultiplier = 0;
        
        const segmentBoosts: Record<string, { count: number; sum: number }> = {};

        data.forEach(spin => {
            if (spin.topSlotSegment && spin.topSlotMultiplier) {
                activeCount++;
                sumMultiplier += spin.topSlotMultiplier;
                
                if (!segmentBoosts[spin.topSlotSegment]) {
                    segmentBoosts[spin.topSlotSegment] = { count: 0, sum: 0 };
                }
                segmentBoosts[spin.topSlotSegment].count++;
                segmentBoosts[spin.topSlotSegment].sum += spin.topSlotMultiplier;
                
                // Did it hit? (The wheel result matches the top slot segment)
                if (spin.topSlotSegment === spin.result) {
                    hitCount++;
                }
            }
        });

        const activationRate = (activeCount / totalSpins) * 100;
        const hitRate = activeCount > 0 ? (hitCount / activeCount) * 100 : 0;
        const avgMultiplier = activeCount > 0 ? (sumMultiplier / activeCount) : 0;

        const topBoostedSegments = Object.entries(segmentBoosts)
            .map(([segment, stats]) => ({
                segment,
                count: stats.count,
                avgMultiplier: stats.sum / stats.count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return {
            activationRate,
            hitRate,
            avgMultiplier,
            topBoostedSegments,
            activeCount,
            hitCount
        };
    }, [data]);

    if (!stats) return null;

    return (
        <div className="w-full bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6">Top Slot Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4 text-center">
                    <div className="text-sm font-bold text-yellow-500/70 uppercase mb-1">Activation Rate</div>
                    <div className="text-3xl font-black text-yellow-400">{stats.activationRate.toFixed(1)}%</div>
                    <div className="text-xs text-yellow-500/50 mt-1">{stats.activeCount} total activations</div>
                </div>
                
                <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4 text-center">
                    <div className="text-sm font-bold text-emerald-500/70 uppercase mb-1">Landing Hit Rate</div>
                    <div className="text-3xl font-black text-emerald-400">{stats.hitRate.toFixed(1)}%</div>
                    <div className="text-xs text-emerald-500/50 mt-1">{stats.hitCount} successful hits</div>
                </div>
                
                <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4 text-center">
                    <div className="text-sm font-bold text-blue-500/70 uppercase mb-1">Avg Multiplier</div>
                    <div className="text-3xl font-black text-blue-400">{stats.avgMultiplier.toFixed(1)}x</div>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Most Frequently Boosted</h4>
                <div className="space-y-3">
                    {stats.topBoostedSegments.map((item, idx) => (
                        <div key={item.segment} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                            <div className="flex items-center gap-4">
                                <span className="text-slate-500 font-mono">#{idx + 1}</span>
                                <span className="font-bold text-white text-lg">{item.segment}</span>
                            </div>
                            <div className="flex gap-6 text-right">
                                <div>
                                    <div className="text-xs text-slate-500">Count</div>
                                    <div className="font-bold text-slate-300">{item.count}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">Avg Mult</div>
                                    <div className="font-bold text-yellow-400">{item.avgMultiplier.toFixed(1)}x</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
