'use client';
import { useMemo } from 'react';
import type { SpinRecord } from '../lib/types';

interface StreakTrackerProps {
    data: SpinRecord[] | undefined;
}

const BONUS_GAMES = [
    { name: 'Coin Flip', expectedInterval: 14 },
    { name: 'Pachinko', expectedInterval: 27 },
    { name: 'Cash Hunt', expectedInterval: 27 },
    { name: 'Crazy Time', expectedInterval: 54 },
];

export default function StreakTracker({ data }: StreakTrackerProps) {
    const streaks = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        // Data is assumed to be ordered newest first (descending timestamp)
        return BONUS_GAMES.map(bonus => {
            let roundsSinceLast = 0;
            for (let i = 0; i < data.length; i++) {
                if (data[i].result === bonus.name) break;
                roundsSinceLast++;
            }
            
            const isDrought = roundsSinceLast > bonus.expectedInterval * 1.5;
            const progressPercent = Math.min((roundsSinceLast / (bonus.expectedInterval * 2)) * 100, 100);

            return {
                ...bonus,
                roundsSinceLast,
                isDrought,
                progressPercent,
            };
        });
    }, [data]);

    if (!data || data.length === 0) return null;

    return (
        <div className="w-full bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6">Bonus Game Droughts</h3>
            <div className="space-y-6">
                {streaks.map(streak => (
                    <div key={streak.name} className="space-y-2">
                        <div className="flex justify-between items-end">
                            <div>
                                <h4 className="font-bold text-slate-200">{streak.name}</h4>
                                <span className="text-xs text-slate-500">Expected: 1 in {streak.expectedInterval}</span>
                            </div>
                            <div className="text-right">
                                <span className={`text-2xl font-black ${streak.isDrought ? 'text-rose-500' : 'text-blue-400'}`}>
                                    {streak.roundsSinceLast}
                                </span>
                                <span className="text-sm text-slate-400 ml-1">spins ago</span>
                            </div>
                        </div>
                        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700/50">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ${
                                    streak.isDrought ? 'bg-gradient-to-r from-orange-500 to-rose-600' : 'bg-gradient-to-r from-blue-600 to-blue-400'
                                }`}
                                style={{ width: `${streak.progressPercent}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
