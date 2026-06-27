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
    // 1. Top Slot State
    const [topSlotSegment, setTopSlotSegment] = useState<string>('1');
    const [topSlotMultiplier, setTopSlotMultiplier] = useState<string>('');

    // 2. Main Spin State
    const [selectedSegment, setSelectedSegment] = useState<string>('1');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // 3. Dynamic Resolution States
    const [numPayout, setNumPayout] = useState<string>('1');

    // Coin Flip
    const [cfRed, setCfRed] = useState<string>('');
    const [cfBlue, setCfBlue] = useState<string>('');
    const [cfWinner, setCfWinner] = useState<'Red' | 'Blue'>('Red');

    // Pachinko
    const [pchHighest, setPchHighest] = useState<string>('');
    const [pchEventual, setPchEventual] = useState<string>('');

    // Crowd Bonuses (Cash Hunt & Crazy Time)
    const [crowdTotalWin, setCrowdTotalWin] = useState<string>('');
    const [crowdPlayers, setCrowdPlayers] = useState<string>('');
    const [chHighest, setChHighest] = useState<string>('');

    // Crazy Time Specific
    const [ctGreen, setCtGreen] = useState<string>('');
    const [ctBlue, setCtBlue] = useState<string>('');
    const [ctYellow, setCtYellow] = useState<string>('');

    // Master Eventual Multiplier (Calculated for submission)
    const [finalCalculatedMultiplier, setFinalCalculatedMultiplier] = useState<number>(1);

    // Auto-Calculate Engine
    useEffect(() => {
        const segmentData = SEGMENTS.find(s => s.name === selectedSegment);
        if (!segmentData) return;

        let eventual = 0;

        if (segmentData.type === 'number') {
            // Apply Top Slot if it matches, otherwise use manual input
            if (topSlotSegment === selectedSegment && topSlotMultiplier) {
                eventual = parseInt(topSlotMultiplier, 10);
                setNumPayout(topSlotMultiplier); // Sync visual input
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
            // Calculate mathematical average: Total Win / Number of Players
            const win = parseFloat(crowdTotalWin) || 0;
            const players = parseFloat(crowdPlayers) || 1; // Prevent div by zero
            eventual = players > 0 ? Math.round(win / players) : 0;
        }

        setFinalCalculatedMultiplier(eventual);
    }, [selectedSegment, topSlotSegment, topSlotMultiplier, numPayout, cfRed, cfBlue, cfWinner, pchEventual, crowdTotalWin, crowdPlayers]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedSegment || finalCalculatedMultiplier <= 0) return;

        setIsSubmitting(true);
        try {
            // Note: The API currently only accepts finalMultiplier. 
            // The extra variables (Highest Multiplier, Colors, etc.) are calculated locally.
            // When we upgrade the backend database, we will send these as a JSON 'metadata' string.
            await api.post('/spins', {
                userEmail: "architect@pralayantaka.com",
                gameType: "Crazy Time",
                finalMultiplier: finalCalculatedMultiplier,
                result: selectedSegment,
            });

            // Reset to default
            setSelectedSegment('1');
            setTopSlotMultiplier('');
            setNumPayout('1');
            setCfRed(''); setCfBlue('');
            setPchHighest(''); setPchEventual('');
            setCrowdTotalWin(''); setCrowdPlayers(''); setChHighest('');
            setCtGreen(''); setCtBlue(''); setCtYellow('');
        } catch (error) {
            console.error('Error saving spin:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentSegmentType = SEGMENTS.find(s => s.name === selectedSegment)?.type;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700 shadow-xl">

            {/* STEP 1: Top Slot Engine */}
            <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/80">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                    Step 1: Top Slot Result
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <select
                        value={topSlotSegment}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setTopSlotSegment(e.target.value)}
                        className="bg-slate-800 border border-slate-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none font-bold"
                    >
                        {SEGMENTS.map(s => <option key={`ts-${s.name}`} value={s.name}>{s.name}</option>)}
                    </select>
                    <div className="relative">
                        <input
                            type="number"
                            value={topSlotMultiplier}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setTopSlotMultiplier(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 text-yellow-400 p-3 pl-4 pr-8 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none font-black"
                            placeholder="Multiplier"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-500 font-bold">x</span>
                    </div>
                </div>
            </div>

            {/* STEP 2: Wheel Result */}
            <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Step 2: Wheel Result</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {SEGMENTS.map((segment) => {
                        const isActive = selectedSegment === segment.name;
                        return (
                            <button
                                key={segment.name}
                                type="button"
                                onClick={() => setSelectedSegment(segment.name)}
                                className={`relative overflow-hidden group rounded-xl border-2 transition-all duration-300 h-20 flex items-center justify-center bg-slate-900
                                    ${isActive ? `${segment.color} shadow-[0_0_20px_rgba(0,0,0,0.5)] ${segment.shadow} scale-105` : 'border-slate-700/50 hover:border-slate-500'}
                                `}
                            >
                                <div className="z-10 absolute inset-0 p-2 flex items-center justify-center">
                                    <Image
                                        src={`/images/${segment.id}.png`}
                                        alt={segment.name}
                                        fill sizes="25vw"
                                        className={`object-contain transition-transform duration-300 ${isActive ? 'scale-110' : 'opacity-60 group-hover:opacity-100'}`}
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                    <span className="font-black text-lg tracking-wider text-slate-400 group-hover:text-white uppercase drop-shadow-lg text-center z-0">
                                        {segment.name}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* STEP 3: Dynamic Resolution Board */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-inner">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Step 3: Outcome Resolution</h3>

                {/* Logic 1: Numbers */}
                {currentSegmentType === 'number' && (
                    <div className="flex items-center gap-4">
                        <label className="text-slate-400 font-bold w-1/3">Eventual Multiplier</label>
                        <input type="number" value={numPayout} onChange={e => setNumPayout(e.target.value)} className="flex-1 bg-slate-800 border border-slate-600 text-white p-3 rounded-lg font-black text-xl" />
                    </div>
                )}

                {/* Logic 2: Coin Flip */}
                {currentSegmentType === 'coin-flip' && (
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 bg-red-950/30 p-3 rounded-lg border border-red-900/50">
                                <label className="text-red-400 font-bold block mb-2 text-sm uppercase">Red Multiplier</label>
                                <input type="number" value={cfRed} onChange={e => setCfRed(e.target.value)} className="w-full bg-slate-900 border border-red-800 text-red-400 p-2 rounded font-bold" />
                            </div>
                            <div className="flex-1 bg-blue-950/30 p-3 rounded-lg border border-blue-900/50">
                                <label className="text-blue-400 font-bold block mb-2 text-sm uppercase">Blue Multiplier</label>
                                <input type="number" value={cfBlue} onChange={e => setCfBlue(e.target.value)} className="w-full bg-slate-900 border border-blue-800 text-blue-400 p-2 rounded font-bold" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-800 p-3 rounded-lg">
                            <label className="text-slate-300 font-bold">Winning Side:</label>
                            <select value={cfWinner} onChange={(e: any) => setCfWinner(e.target.value)} className={`flex-1 p-2 rounded font-black outline-none ${cfWinner === 'Red' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
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
                            <label className="text-slate-400 text-xs font-bold uppercase block mb-2">Highest Available (Emotional)</label>
                            <input type="number" value={pchHighest} onChange={e => setPchHighest(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-slate-300 p-2 rounded font-bold" />
                        </div>
                        <div className="bg-fuchsia-950/30 p-3 rounded-lg border border-fuchsia-900/50">
                            <label className="text-fuchsia-400 text-xs font-bold uppercase block mb-2">Eventual Multiplier (Actual)</label>
                            <input type="number" value={pchEventual} onChange={e => setPchEventual(e.target.value)} className="w-full bg-slate-900 border border-fuchsia-800 text-fuchsia-400 p-2 rounded font-black text-lg" />
                        </div>
                    </div>
                )}

                {/* Logic 4: Cash Hunt */}
                {currentSegmentType === 'cash-hunt' && (
                    <div className="space-y-4">
                        <div className="bg-slate-800/50 p-3 rounded-lg">
                            <label className="text-slate-400 text-xs font-bold uppercase block mb-2">Highest Possible (Emotional)</label>
                            <input type="number" value={chHighest} onChange={e => setChHighest(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-slate-300 p-2 rounded font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 bg-emerald-950/30 p-4 rounded-lg border border-emerald-900/50">
                            <div>
                                <label className="text-emerald-400 text-xs font-bold uppercase block mb-2">Total Win</label>
                                <input type="number" value={crowdTotalWin} onChange={e => setCrowdTotalWin(e.target.value)} className="w-full bg-slate-900 border border-emerald-800 text-emerald-400 p-2 rounded font-bold" />
                            </div>
                            <div>
                                <label className="text-emerald-400 text-xs font-bold uppercase block mb-2">Number of Players</label>
                                <input type="number" value={crowdPlayers} onChange={e => setCrowdPlayers(e.target.value)} className="w-full bg-slate-900 border border-emerald-800 text-emerald-400 p-2 rounded font-bold" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Logic 5: Crazy Time */}
                {currentSegmentType === 'crazy-time' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-green-950/30 p-2 rounded-lg border border-green-900/50">
                                <label className="text-green-400 text-[10px] font-black uppercase block mb-1">Green</label>
                                <input type="number" value={ctGreen} onChange={e => setCtGreen(e.target.value)} className="w-full bg-slate-900 border border-green-800 text-green-400 p-2 rounded font-bold" />
                            </div>
                            <div className="bg-blue-950/30 p-2 rounded-lg border border-blue-900/50">
                                <label className="text-blue-400 text-[10px] font-black uppercase block mb-1">Blue</label>
                                <input type="number" value={ctBlue} onChange={e => setCtBlue(e.target.value)} className="w-full bg-slate-900 border border-blue-800 text-blue-400 p-2 rounded font-bold" />
                            </div>
                            <div className="bg-yellow-950/30 p-2 rounded-lg border border-yellow-900/50">
                                <label className="text-yellow-400 text-[10px] font-black uppercase block mb-1">Yellow</label>
                                <input type="number" value={ctYellow} onChange={e => setCtYellow(e.target.value)} className="w-full bg-slate-900 border border-yellow-800 text-yellow-400 p-2 rounded font-bold" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 bg-rose-950/30 p-4 rounded-lg border border-rose-900/50">
                            <div>
                                <label className="text-rose-400 text-xs font-bold uppercase block mb-2">Total Win</label>
                                <input type="number" value={crowdTotalWin} onChange={e => setCrowdTotalWin(e.target.value)} className="w-full bg-slate-900 border border-rose-800 text-rose-400 p-2 rounded font-bold" />
                            </div>
                            <div>
                                <label className="text-rose-400 text-xs font-bold uppercase block mb-2">Number of Players</label>
                                <input type="number" value={crowdPlayers} onChange={e => setCrowdPlayers(e.target.value)} className="w-full bg-slate-900 border border-rose-800 text-rose-400 p-2 rounded font-bold" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Submission Block */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                <div className="bg-slate-950 border border-slate-700 rounded-xl p-4 flex-1 flex justify-between items-center w-full">
                    <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Calculated Eventual Multiplier</span>
                    <span className="text-3xl font-black text-white">{finalCalculatedMultiplier}x</span>
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting || finalCalculatedMultiplier <= 0}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-widest py-5 px-12 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                    {isSubmitting ? 'Logging...' : 'Confirm Round'}
                </button>
            </div>
        </form>
    );
}