'use client';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Legend, Cell } from 'recharts';
import type { SpinRecord } from '../lib/types';

interface ProbabilityDashboardProps {
    data: SpinRecord[] | undefined;
}

const EXPECTED_PROBABILITIES = {
    '1': 38.89,
    '2': 24.07,
    '5': 12.96,
    '10': 7.41,
    'Coin Flip': 7.41,
    'Pachinko': 3.70,
    'Cash Hunt': 3.70,
    'Crazy Time': 1.85,
};

export default function ProbabilityDashboard({ data }: ProbabilityDashboardProps) {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        const counts: Record<string, number> = {};
        data.forEach(spin => {
            counts[spin.result] = (counts[spin.result] || 0) + 1;
        });

        const totalSpins = data.length;

        return Object.entries(EXPECTED_PROBABILITIES).map(([segment, expected]) => {
            const actualCount = counts[segment] || 0;
            const actual = (actualCount / totalSpins) * 100;
            const diff = actual - expected;
            return {
                name: segment,
                expected: Number(expected.toFixed(2)),
                actual: Number(actual.toFixed(2)),
                diff: Number(diff.toFixed(2)),
            };
        });
    }, [data]);

    if (!data || data.length === 0) return null;

    return (
        <div className="w-full bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2">Probability Analysis (Expected vs Actual)</h3>
            <p className="text-sm text-slate-400 mb-6">Compares the real wheel distribution against actual hit rates.</p>
            <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                        <Tooltip
                            cursor={{ fill: '#1e293b', opacity: 0.5 }}
                            contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc' }}
                            formatter={(value: number) => [`${value}%`]}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="expected" name="Expected %" fill="#475569" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="actual" name="Actual %" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.diff >= 0 ? '#10b981' : '#f43f5e'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {chartData.map(stat => (
                    <div key={stat.name} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 text-center">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.name}</div>
                        <div className={`text-lg font-black ${stat.diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {stat.diff > 0 ? '+' : ''}{stat.diff}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
