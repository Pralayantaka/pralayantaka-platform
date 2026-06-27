'use client';
import { useMemo } from 'react';
import type { SpinRecord, CoinFlipData, PachinkoData, CashHuntData, CrazyTimeData } from '../lib/types';

interface BonusGameStatsProps {
    data: SpinRecord[] | undefined;
}

export default function BonusGameStats({ data }: BonusGameStatsProps) {
    const stats = useMemo(() => {
        if (!data || data.length === 0) return null;

        let cfSpins = 0;
        let cfRedWins = 0;
        let cfBlueWins = 0;
        let cfSumRed = 0;
        let cfSumBlue = 0;

        let pachinkoSpins = 0;
        let pchSumEventual = 0;
        let pchSumHighest = 0;

        let cashHuntSpins = 0;
        let chSumEventual = 0;
        let chSumHighest = 0;

        let crazyTimeSpins = 0;
        let ctSumGreen = 0;
        let ctSumBlue = 0;
        let ctSumYellow = 0;

        data.forEach(spin => {
            if (!spin.gameSpecificData) return;
            
            try {
                const specificData = JSON.parse(spin.gameSpecificData);

                if (spin.result === 'Coin Flip') {
                    const cf = specificData as CoinFlipData;
                    cfSpins++;
                    if (cf.winner === 'Red') cfRedWins++;
                    if (cf.winner === 'Blue') cfBlueWins++;
                    cfSumRed += (cf.redMultiplier || 0);
                    cfSumBlue += (cf.blueMultiplier || 0);
                }
                else if (spin.result === 'Pachinko') {
                    const pch = specificData as PachinkoData;
                    pachinkoSpins++;
                    pchSumEventual += (pch.eventualMultiplier || 0);
                    pchSumHighest += (pch.highestAvailable || 0);
                }
                else if (spin.result === 'Cash Hunt') {
                    const ch = specificData as CashHuntData;
                    cashHuntSpins++;
                    chSumEventual += spin.finalMultiplier;
                    chSumHighest += (ch.highestPossible || 0);
                }
                else if (spin.result === 'Crazy Time') {
                    const ct = specificData as CrazyTimeData;
                    crazyTimeSpins++;
                    ctSumGreen += (ct.greenFlap || 0);
                    ctSumBlue += (ct.blueFlap || 0);
                    ctSumYellow += (ct.yellowFlap || 0);
                }
            } catch (e) {
                // Ignore parse errors
            }
        });

        return {
            coinFlip: {
                count: cfSpins,
                redWinRate: cfSpins > 0 ? (cfRedWins / cfSpins) * 100 : 0,
                blueWinRate: cfSpins > 0 ? (cfBlueWins / cfSpins) * 100 : 0,
                avgRed: cfSpins > 0 ? cfSumRed / cfSpins : 0,
                avgBlue: cfSpins > 0 ? cfSumBlue / cfSpins : 0,
            },
            pachinko: {
                count: pachinkoSpins,
                avgEventual: pachinkoSpins > 0 ? pchSumEventual / pachinkoSpins : 0,
                avgHighest: pachinkoSpins > 0 ? pchSumHighest / pachinkoSpins : 0,
            },
            cashHunt: {
                count: cashHuntSpins,
                avgEventual: cashHuntSpins > 0 ? chSumEventual / cashHuntSpins : 0,
                avgHighest: cashHuntSpins > 0 ? chSumHighest / cashHuntSpins : 0,
            },
            crazyTime: {
                count: crazyTimeSpins,
                avgGreen: crazyTimeSpins > 0 ? ctSumGreen / crazyTimeSpins : 0,
                avgBlue: crazyTimeSpins > 0 ? ctSumBlue / crazyTimeSpins : 0,
                avgYellow: crazyTimeSpins > 0 ? ctSumYellow / crazyTimeSpins : 0,
            }
        };
    }, [data]);

    if (!stats) return null;

    return (
        <div className="w-full bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6">Bonus Game Deep Dive</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Coin Flip */}
                <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50 border-t-4 border-t-red-500">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-white uppercase tracking-wider">Coin Flip</h4>
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">{stats.coinFlip.count} recorded</span>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-red-400">Red Wins ({stats.coinFlip.redWinRate.toFixed(1)}%)</span>
                                <span className="text-blue-400">Blue Wins ({stats.coinFlip.blueWinRate.toFixed(1)}%)</span>
                            </div>
                            <div className="flex h-2 rounded-full overflow-hidden bg-slate-800">
                                <div style={{ width: `${stats.coinFlip.redWinRate}%` }} className="bg-red-500"></div>
                                <div style={{ width: `${stats.coinFlip.blueWinRate}%` }} className="bg-blue-500"></div>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <div className="text-center">
                                <div className="text-[10px] text-slate-500 uppercase">Avg Red Mult</div>
                                <div className="font-bold text-red-400">{stats.coinFlip.avgRed.toFixed(1)}x</div>
                            </div>
                            <div className="text-center">
                                <div className="text-[10px] text-slate-500 uppercase">Avg Blue Mult</div>
                                <div className="font-bold text-blue-400">{stats.coinFlip.avgBlue.toFixed(1)}x</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pachinko */}
                <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50 border-t-4 border-t-fuchsia-500">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-white uppercase tracking-wider">Pachinko</h4>
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">{stats.pachinko.count} recorded</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700/50">
                            <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Avg Eventual</div>
                            <div className="text-2xl font-black text-fuchsia-400">{stats.pachinko.avgEventual.toFixed(1)}x</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700/50">
                            <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Avg Highest</div>
                            <div className="text-2xl font-black text-slate-300">{stats.pachinko.avgHighest.toFixed(1)}x</div>
                        </div>
                    </div>
                </div>

                {/* Cash Hunt */}
                <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50 border-t-4 border-t-emerald-500">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-white uppercase tracking-wider">Cash Hunt</h4>
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">{stats.cashHunt.count} recorded</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700/50">
                            <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Avg Eventual</div>
                            <div className="text-2xl font-black text-emerald-400">{stats.cashHunt.avgEventual.toFixed(1)}x</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700/50">
                            <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Avg Highest</div>
                            <div className="text-2xl font-black text-slate-300">{stats.cashHunt.avgHighest.toFixed(1)}x</div>
                        </div>
                    </div>
                </div>

                {/* Crazy Time */}
                <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50 border-t-4 border-t-rose-600">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-white uppercase tracking-wider">Crazy Time</h4>
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">{stats.crazyTime.count} recorded</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-green-900/30">
                            <div className="text-[9px] text-green-400 font-bold uppercase mb-1">Avg Green</div>
                            <div className="text-lg font-black text-white">{stats.crazyTime.avgGreen.toFixed(0)}x</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-blue-900/30">
                            <div className="text-[9px] text-blue-400 font-bold uppercase mb-1">Avg Blue</div>
                            <div className="text-lg font-black text-white">{stats.crazyTime.avgBlue.toFixed(0)}x</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-yellow-900/30">
                            <div className="text-[9px] text-yellow-400 font-bold uppercase mb-1">Avg Yellow</div>
                            <div className="text-lg font-black text-white">{stats.crazyTime.avgYellow.toFixed(0)}x</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
