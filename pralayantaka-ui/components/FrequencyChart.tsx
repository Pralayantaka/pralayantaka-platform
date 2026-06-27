'use client';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SpinRecord {
    id: number;
    gameType: string;
    result: string;
    finalMultiplier: number;
    timestamp: string;
}

interface FrequencyChartProps {
    data: SpinRecord[] | undefined;
}

export default function FrequencyChart({ data }: FrequencyChartProps) {
    // This hook transforms the raw list of spins into counted frequencies
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        const counts: Record<string, number> = {};
        data.forEach(spin => {
            counts[spin.result] = (counts[spin.result] || 0) + 1;
        });

        // Convert the object back into an array and sort it highest to lowest
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count); 
    }, [data]);

    if (!data || data.length === 0) {
        return <div className="text-slate-500 text-center py-12">Not enough data to generate chart.</div>;
    }

    return (
        <div className="w-full h-[400px] bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6">Segment Frequency Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis 
                        dataKey="name" 
                        stroke="#64748b" 
                        fontSize={12} 
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis 
                        stroke="#64748b" 
                        fontSize={12} 
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip 
                        cursor={{ fill: '#1e293b', opacity: 0.5 }}
                        contentStyle={{ 
                            backgroundColor: '#0B0F19', 
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            color: '#f8fafc' 
                        }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="#f97316" className="hover:opacity-80 transition-opacity" />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}