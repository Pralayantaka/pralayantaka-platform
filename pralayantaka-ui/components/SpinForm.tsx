'use client';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { api } from '../lib/api';
import Image from 'next/image';

type SegmentType = 'number' | 'coin-flip' | 'pachinko' | 'cash-hunt' | 'crazy-time';

interface Segment {
    name: string;
    id: string;
    type: SegmentType;
    baseMultiplier: number;
    color: string;
    shadow: string;
}

const SEGMENTS: Segment[] = [
    { name: '1', id: '1', type: 'number', baseMultiplier: 1, color: 'border-blue-500', shadow: 'shadow-blue-500/50' },
    { name: '2', id: '2', type: 'number', baseMultiplier: 2, color: 'border-yellow-500', shadow: 'shadow-yellow-500/50' },
    { name: '5', id: '5', type: 'number', baseMultiplier: 5, color: 'border-pink-500', shadow: 'shadow-pink-500/50' },
    { name: '10', id: '10', type: 'number', baseMultiplier: 10, color: 'border-purple-500', shadow: 'shadow-purple-500/50' },
    { name: 'Coin Flip', id: 'coin-flip', type: 'coin-flip', baseMultiplier: 1, color: 'border-red-500', shadow: 'shadow-red-500/50' },
    { name: 'Pachinko', id: 'pachinko', type: 'pachinko', baseMultiplier: 1, color: 'border-fuchsia-500', shadow: 'shadow-fuchsia-500/50' },
    { name: 'Cash Hunt', id: 'cash-hunt', type: 'cash-hunt', baseMultiplier: 1, color: 'border-emerald-500', shadow: 'shadow-emerald-500/50' },
    { name: 'Crazy Time', id: 'crazy-time', type: 'crazy-time', baseMultiplier: 1, color: 'border-rose-600', shadow: 'shadow-rose-600/50' },
];

export default function SpinForm() {
    const [topSlotSegment, setTopSlotSegment] = useState<string>('1');
    const [topSlotMultiplier, setTopSlotMultiplier] = useState<string>('');
    const [isTopSlotActive, setIsTopSlotActive] = useState<boolean>(false);

    const [selectedSegment, setSelectedSegment] = useState<string>('1');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [numPayout, setNumPayout] = useState<string>('1');
    const [cfRed, setCfRed] = useState<string>('');
    const [cfBlue, setCfBlue] = useState<string>('');
    const [cfWinner, setCfWinner] = useState<'Red' | 'Blue'>('Red');

    const [pchHighest, setPchHighest] = useState<string>('');
    const [pchEventual, setPchEventual] = useState<string>('');

    const [crowdTotalWin, setCrowdTotalWin] = useState<string>('');
    const [crowdPlayers, setCrowdPlayers] = useState<string>('');
    const [chHighest, setChHighest] = useState<string>('');

    const [ctGreen, setCtGreen] = useState<string>('');
    const [ctBlue, setCtBlue] = useState<string>('');
    const [ctYellow, setCtYellow] = useState<string>('');

    const [finalCalculatedMultiplier, setFinalCalculatedMultiplier] = useState<number>(1);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        const segmentData = SEGMENTS.find(s => s.name === selectedSegment);
        if (!segmentData) return;

        let eventual = 0;

        if (segmentData.type === 'number') {
            if (isTopSlotActive && topSlotSegment === selectedSegment && topSlotMultiplier) {
                eventual = parseInt(topSlotMultiplier, 10);
            } else {
                eventual = parseInt(numPayout, 10) || segmentData.baseMultiplier;
            }
        }
        else if (segmentData.type === 'coin-flip') {
            eventual = parseInt(cfWinner === 'Red' ? cfRed : cfBlue, 10) || 0;
        }
        else if (segmentData.type === 'pachinko') {
            eventual = parseInt(pchEventual, 10) || 0;
        }
        else if (segmentData.type === 'cash-hunt' || segmentData.type === 'crazy-time') {
            const win = parseFloat(crowdTotalWin) || 0;
            const players = parseFloat(crowdPlayers) || 1;
            eventual = players > 0 ? Math.round(win / players) : 0;
        }

        setFinalCalculatedMultiplier(eventual);
    }, [selectedSegment, isTopSlotActive, topSlotSegment, topSlotMultiplier, numPayout, cfRed, cfBlue, cfWinner, pchEventual, crowdTotalWin, crowdPlayers]);

    const buildGameSpecificData = () => {
        const segmentData = SEGMENTS.find(s => s.name === selectedSegment);
        if (!segmentData) return null;

        switch (segmentData.type) {
            case 'coin-flip':
                return JSON.stringify({
                    redMultiplier: parseFloat(cfRed) || 0,
                    blueMultiplier: parseFloat(cfBlue) || 0,
                    winner: cfWinner,
                });
            case 'pachinko':
                return JSON.stringify({
                    highestAvailable: parseFloat(pchHighest) || 0,
                    eventualMultiplier: parseFloat(pchEventual) || 0,
                });
            case 'cash-hunt':
                return JSON.stringify({
                    highestPossible: parseFloat(chHighest) || 0,
                    totalWin: parseFloat(crowdTotalWin) || 0,
                    numberOfPlayers: parseInt(crowdPlayers, 10) || 0,
                });
            case 'crazy-time':
                return JSON.stringify({
                    greenFlap: parseFloat(ctGreen) || 0,
                    blueFlap: parseFloat(ctBlue) || 0,
                    yellowFlap: parseFloat(ctYellow) || 0,
                    totalWin: parseFloat(crowdTotalWin) || 0,
                    numberOfPlayers: parseInt(crowdPlayers, 10) || 0,
                });
            default:
                return null;
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedSegment || finalCalculatedMultiplier <= 0) return;

        setIsSubmitting(true);
        setNotification(null);
        try {
            await api.post('/spins', {
                userEmail: "architect@pralayantaka.com",
                gameType: "Crazy Time",
                topSlotSegment: isTopSlotActive ? topSlotSegment : null,
                topSlotMultiplier: isTopSlotActive ? (parseFloat(topSlotMultiplier) || null) : null,
                result: selectedSegment,
                finalMultiplier: finalCalculatedMultiplier,
                numberOfPlayers: parseInt(crowdPlayers, 10) || 0,
                totalWinningAmount: parseFloat(crowdTotalWin) || 0,
                gameSpecificData: buildGameSpecificData(),
            });

            setNotification({ type: 'success', message: `Round logged: ${selectedSegment} @ ${finalCalculatedMultiplier}x` });
            setTimeout(() => setNotification(null), 3000);

            // Reset all fields
            setSelectedSegment('1');
            setIsTopSlotActive(false);
            setTopSlotMultiplier('');
            setNumPayout('1');
            setCfRed(''); setCfBlue('');
            setPchHighest(''); setPchEventual('');
            setCrowdTotalWin(''); setCrowdPlayers(''); setChHighest('');
            setCtGreen(''); setCtBlue(''); setCtYellow('');
        } catch (error) {
            setNotification({ type: 'error', message: 'Failed to save spin. Check your connection.' });
            console.error('Error saving spin:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentSegmentType = SEGMENTS.find(s => s.name === selectedSegment)?.type;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700 shadow-xl" aria-label="Game Result Entry Form">

            {/* Notification Banner */}
            {notification && (
                <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-bold transition-all duration-300 ${
                    notification.type === 'success'
                        ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-400'
                        : 'bg-red-950/50 border-red-500/30 text-red-400'
                }`}>
                    <span>{notification.type === 'success' ? '✓' : '✕'}</span>
                    <span>{notification.message}</span>
                </div>
            )}

            {/* STEP 1: Top Slot Engine */}
            <fieldset className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/80">
                <legend className="sr-only">Step 1: Top Slot Engine Configuration</legend>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2" aria-hidden="true">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                        Step 1: Top Slot Result
                    </h3>
                    <label htmlFor="top-slot-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            id="top-slot-toggle"
                            className="sr-only peer"
                            checked={isTopSlotActive}
                            onChange={() => setIsTopSlotActive(!isTopSlotActive)}
                            aria-label="Toggle Top Slot Engine"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus-visible:ring-4 peer-focus-visible:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                </div>

                {isTopSlotActive && (
                    <div className="flex flex-col gap-4 mt-4">
                        <div className="flex flex-col gap-1">
                            <label htmlFor="top-slot-segment" className="text-xs font-bold text-slate-300">Target Segment</label>
                            <select
                                id="top-slot-segment"
                                value={topSlotSegment}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => setTopSlotSegment(e.target.value)}
                                className="bg-slate-800 border border-slate-600 text-white p-3 rounded-lg focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:outline-none font-bold"
                            >
                                {SEGMENTS.map(s => <option key={`ts-${s.name}`} value={s.name}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-slate-300 mb-1">Multiplier Value</label>
                            <div className="flex flex-wrap gap-2">
                                {[2, 3, 4, 5, 7, 10, 15, 20, 25, 50].map((mult) => (
                                    <button
                                        key={`ts-mult-${mult}`}
                                        type="button"
                                        onClick={() => setTopSlotMultiplier(mult.toString())}
                                        className={`flex-1 min-w-[45px] py-2 rounded-lg font-black text-sm transition-all border ${
                                            topSlotMultiplier === mult.toString()
                                                ? 'bg-yellow-500 text-slate-900 border-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)] scale-105'
                                                : 'bg-slate-800 text-yellow-500 border-slate-600 hover:bg-slate-700 hover:border-slate-500'
                                        }`}
                                    >
                                        {mult}x
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </fieldset>

            {/* STEP 2: Wheel Result */}
            <fieldset role="radiogroup" aria-labelledby="wheel-result-heading">
                <h3 id="wheel-result-heading" className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-3">Step 2: Wheel Result</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {SEGMENTS.map((segment) => {
                        const isActive = selectedSegment === segment.name;
                        return (
                            <button
                                key={segment.name}
                                type="button"
                                role="radio"
                                aria-checked={isActive}
                                onClick={() => setSelectedSegment(segment.name)}
                                className={`relative overflow-hidden group rounded-xl border-2 transition-all duration-300 h-20 flex items-center justify-center bg-slate-900 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none
                                    ${isActive ? `${segment.color} shadow-[0_0_20px_rgba(0,0,0,0.5)] ${segment.shadow} scale-105` : 'border-slate-700/50 hover:border-slate-500'}
                                `}
                            >
                                <div className="z-10 absolute inset-0 p-2 flex items-center justify-center">
                                    <Image
                                        src={`/images/${segment.id}.png`}
                                        alt={`Select ${segment.name}`}
                                        fill sizes="25vw"
                                        className={`object-contain transition-transform duration-300 ${isActive ? 'scale-110' : 'opacity-60 group-hover:opacity-100'}`}
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </fieldset>

            {/* STEP 3: Dynamic Resolution Board */}
            <fieldset className="bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-inner">
                <legend className="sr-only">Step 3: Outcome Resolution Configuration</legend>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-4" aria-hidden="true">Step 3: Outcome Resolution</h3>

                {/* Logic 1: Numbers */}
                {currentSegmentType === 'number' && (
                    <div className="flex items-center gap-4">
                        <label htmlFor="num-payout" className="text-slate-200 font-bold w-1/3">Eventual Multiplier</label>
                        <input id="num-payout" type="number" value={numPayout} onChange={e => setNumPayout(e.target.value)} className="flex-1 bg-slate-800 border border-slate-600 text-white p-3 rounded-lg font-black text-xl focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none" />
                    </div>
                )}

                {/* Logic 2: Coin Flip */}
                {currentSegmentType === 'coin-flip' && (
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 bg-red-950/30 p-3 rounded-lg border border-red-900/50">
                                <label htmlFor="cf-red" className="text-red-400 font-bold block mb-2 text-sm uppercase">Red Multiplier</label>
                                <input id="cf-red" type="number" value={cfRed} onChange={e => setCfRed(e.target.value)} className="w-full bg-slate-900 border border-red-800 text-red-400 p-2 rounded font-bold focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none" />
                            </div>
                            <div className="flex-1 bg-blue-950/30 p-3 rounded-lg border border-blue-900/50">
                                <label htmlFor="cf-blue" className="text-blue-400 font-bold block mb-2 text-sm uppercase">Blue Multiplier</label>
                                <input id="cf-blue" type="number" value={cfBlue} onChange={e => setCfBlue(e.target.value)} className="w-full bg-slate-900 border border-blue-800 text-blue-400 p-2 rounded font-bold focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-800 p-3 rounded-lg">
                            <label htmlFor="cf-winner" className="text-slate-200 font-bold">Winning Side:</label>
                            <select id="cf-winner" value={cfWinner} onChange={(e: any) => setCfWinner(e.target.value)} className={`flex-1 p-2 rounded font-black focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none ${cfWinner === 'Red' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                                <option value="Red">RED</option>
                                <option value="Blue">BLUE</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Logic 3: Pachinko */}
                {currentSegmentType === 'pachinko' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 p-3 rounded-lg">
                            <label htmlFor="pch-highest" className="text-slate-300 text-xs font-bold uppercase block mb-2">Highest Available</label>
                            <input id="pch-highest" type="number" value={pchHighest} onChange={e => setPchHighest(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-slate-100 p-2 rounded font-bold focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:outline-none" />
                        </div>
                        <div className="bg-fuchsia-950/30 p-3 rounded-lg border border-fuchsia-900/50">
                            <label htmlFor="pch-eventual" className="text-fuchsia-400 text-xs font-bold uppercase block mb-2">Eventual Multiplier</label>
                            <input id="pch-eventual" type="number" value={pchEventual} onChange={e => setPchEventual(e.target.value)} className="w-full bg-slate-900 border border-fuchsia-800 text-fuchsia-400 p-2 rounded font-black text-lg focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:outline-none" />
                        </div>
                    </div>
                )}

                {/* Logic 4: Cash Hunt */}
                {currentSegmentType === 'cash-hunt' && (
                    <div className="space-y-4">
                        <div className="bg-slate-800/50 p-3 rounded-lg">
                            <label htmlFor="ch-highest" className="text-slate-300 text-xs font-bold uppercase block mb-2">Highest Possible</label>
                            <input id="ch-highest" type="number" value={chHighest} onChange={e => setChHighest(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-slate-100 p-2 rounded font-bold focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 bg-emerald-950/30 p-4 rounded-lg border border-emerald-900/50">
                            <div>
                                <label htmlFor="ch-total-win" className="text-emerald-400 text-xs font-bold uppercase block mb-2">Total Win</label>
                                <input id="ch-total-win" type="number" value={crowdTotalWin} onChange={e => setCrowdTotalWin(e.target.value)} className="w-full bg-slate-900 border border-emerald-800 text-emerald-400 p-2 rounded font-bold focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none" />
                            </div>
                            <div>
                                <label htmlFor="ch-players" className="text-emerald-400 text-xs font-bold uppercase block mb-2">Number of Players</label>
                                <input id="ch-players" type="number" value={crowdPlayers} onChange={e => setCrowdPlayers(e.target.value)} className="w-full bg-slate-900 border border-emerald-800 text-emerald-400 p-2 rounded font-bold focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Logic 5: Crazy Time */}
                {currentSegmentType === 'crazy-time' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-green-950/30 p-2 rounded-lg border border-green-900/50">
                                <label htmlFor="ct-green" className="text-green-400 text-[10px] font-black uppercase block mb-1">Green</label>
                                <input id="ct-green" type="number" value={ctGreen} onChange={e => setCtGreen(e.target.value)} className="w-full bg-slate-900 border border-green-800 text-green-400 p-2 rounded font-bold focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:outline-none" />
                            </div>
                            <div className="bg-blue-950/30 p-2 rounded-lg border border-blue-900/50">
                                <label htmlFor="ct-blue" className="text-blue-400 text-[10px] font-black uppercase block mb-1">Blue</label>
                                <input id="ct-blue" type="number" value={ctBlue} onChange={e => setCtBlue(e.target.value)} className="w-full bg-slate-900 border border-blue-800 text-blue-400 p-2 rounded font-bold focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none" />
                            </div>
                            <div className="bg-yellow-950/30 p-2 rounded-lg border border-yellow-900/50">
                                <label htmlFor="ct-yellow" className="text-yellow-400 text-[10px] font-black uppercase block mb-1">Yellow</label>
                                <input id="ct-yellow" type="number" value={ctYellow} onChange={e => setCtYellow(e.target.value)} className="w-full bg-slate-900 border border-yellow-800 text-yellow-400 p-2 rounded font-bold focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:outline-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 bg-rose-950/30 p-4 rounded-lg border border-rose-900/50">
                            <div>
                                <label htmlFor="ct-total-win" className="text-rose-400 text-xs font-bold uppercase block mb-2">Total Win</label>
                                <input id="ct-total-win" type="number" value={crowdTotalWin} onChange={e => setCrowdTotalWin(e.target.value)} className="w-full bg-slate-900 border border-rose-800 text-rose-400 p-2 rounded font-bold focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none" />
                            </div>
                            <div>
                                <label htmlFor="ct-players" className="text-rose-400 text-xs font-bold uppercase block mb-2">Number of Players</label>
                                <input id="ct-players" type="number" value={crowdPlayers} onChange={e => setCrowdPlayers(e.target.value)} className="w-full bg-slate-900 border border-rose-800 text-rose-400 p-2 rounded font-bold focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none" />
                            </div>
                        </div>
                    </div>
                )}
            </fieldset>

            {/* Submission Block */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                <div
                    className="bg-slate-950 border border-slate-700 rounded-xl p-4 flex-1 flex justify-between items-center w-full"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    <span className="text-slate-300 font-bold uppercase text-xs tracking-widest">Calculated Eventual Multiplier</span>
                    <span className="text-3xl font-black text-white">{finalCalculatedMultiplier}x</span>
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting || finalCalculatedMultiplier <= 0}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-widest py-5 px-12 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 focus-visible:ring-4 focus-visible:ring-indigo-400 focus-visible:outline-none"
                    aria-busy={isSubmitting}
                >
                    {isSubmitting ? 'Logging...' : 'Confirm Round'}
                </button>
            </div>
        </form>
    );
}