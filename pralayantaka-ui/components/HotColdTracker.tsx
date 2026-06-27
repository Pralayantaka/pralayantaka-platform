'use client';
import { SpinRecord } from '../lib/types';

interface HotColdTrackerProps {
    spins: SpinRecord[];
}

const THEO_PROBS: Record<string, number> = {
    "1": 38.89, "2": 24.07, "5": 12.96, "10": 7.41,
    "Coin Flip": 7.41, "Pachinko": 3.70, "Cash Hunt": 3.70, "Crazy Time": 1.85
};

export default function HotColdTracker({ spins }: HotColdTrackerProps) {
    if (spins.length === 0) return null;

    // Spins are ordered DESC (newest first). 
    // The spins array index is the "spins ago".
    const trackerData = Object.entries(THEO_PROBS).map(([seg, prob]) => {
        const expectedSpins = parseFloat((100 / prob).toFixed(1));
        const lastHitIndex = spins.findIndex(s => s.result === seg);
        const spinsAgo = lastHitIndex === -1 ? spins.length : lastHitIndex;

        let status = '⚪ Normal';
        let statusColor = 'text-slate-400';
        
        if (spinsAgo < (expectedSpins * 0.5)) {
            status = '🔥 HOT';
            statusColor = 'text-orange-500 font-bold';
        } else if (spinsAgo > (expectedSpins * 1.5)) {
            status = '❄️ OVERDUE';
            statusColor = 'text-blue-400 font-bold';
        }

        return {
            segment: seg,
            spinsAgo,
            expectedSpins,
            status,
            statusColor
        };
    });

    return (
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700 shadow-xl overflow-hidden p-6">
            <h2 className="text-xl font-bold text-slate-100 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="text-orange-500">🔥</span> Hot / Cold Tracking
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 uppercase font-black text-xs">
                        <tr>
                            <th className="px-4 py-3 rounded-tl-lg">Segment</th>
                            <th className="px-4 py-3 text-right">Spins Since Hit</th>
                            <th className="px-4 py-3 text-right">Expected Interval</th>
                            <th className="px-4 py-3 text-center rounded-tr-lg">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {trackerData.map((data, idx) => (
                            <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                                <td className="px-4 py-3 font-bold text-white">{data.segment}</td>
                                <td className="px-4 py-3 text-right tabular-nums">{data.spinsAgo}</td>
                                <td className="px-4 py-3 text-right tabular-nums text-slate-400">{data.expectedSpins}</td>
                                <td className={`px-4 py-3 text-center ${data.statusColor}`}>{data.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
