'use client';
import { SpinRecord } from '../lib/types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface PayoutMomentumChartProps {
    spins: SpinRecord[];
}

export default function PayoutMomentumChart({ spins }: PayoutMomentumChartProps) {
    if (spins.length < 3) return null;

    // We need oldest first to calculate rolling average over time
    const chronologicalSpins = [...spins].reverse();

    const chartData = chronologicalSpins.map((spin, index) => {
        const payoutPerPlayer = spin.numberOfPlayers > 0 ? (spin.totalWinningAmount / spin.numberOfPlayers) : 0;
        
        let rollingSum = 0;
        let count = 0;
        // 5-spin window (current spin + 4 previous)
        for (let i = Math.max(0, index - 4); i <= index; i++) {
            const p = chronologicalSpins[i].numberOfPlayers > 0 
                ? (chronologicalSpins[i].totalWinningAmount / chronologicalSpins[i].numberOfPlayers) 
                : 0;
            rollingSum += p;
            count++;
        }
        const rollingAvg = rollingSum / count;

        return {
            id: spin.id,
            "Actual Payout": parseFloat(payoutPerPlayer.toFixed(2)),
            "5-Spin Avg": parseFloat(rollingAvg.toFixed(2))
        };
    });

    return (
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700 shadow-xl p-6">
            <h2 className="text-xl font-bold text-slate-100 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="text-blue-500">📈</span> Payout Momentum
            </h2>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis 
                            dataKey="id" 
                            stroke="#94a3b8" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(value) => `#${value}`}
                        />
                        <YAxis 
                            stroke="#94a3b8" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                            itemStyle={{ fontWeight: 'bold' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line 
                            type="monotone" 
                            dataKey="Actual Payout" 
                            stroke="#3B82F6" 
                            strokeWidth={2}
                            dot={{ fill: '#3B82F6', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="5-Spin Avg" 
                            stroke="#FACC15" 
                            strokeWidth={3}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
