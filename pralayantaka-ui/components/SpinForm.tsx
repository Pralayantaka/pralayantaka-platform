'use client';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { api } from '../lib/api';
import Image from 'next/image';

// 1. Explicitly define the types to satisfy Strict Mode
type SegmentType = 'number' | 'bonus';

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
    { name: 'Coin Flip', id: 'coin-flip', type: 'bonus', baseMultiplier: 1, color: 'border-red-500', shadow: 'shadow-red-500/50' },
    { name: 'Pachinko', id: 'pachinko', type: 'bonus', baseMultiplier: 1, color: 'border-fuchsia-500', shadow: 'shadow-fuchsia-500/50' },
    { name: 'Cash Hunt', id: 'cash-hunt', type: 'bonus', baseMultiplier: 1, color: 'border-emerald-500', shadow: 'shadow-emerald-500/50' },
    { name: 'Crazy Time', id: 'crazy-time', type: 'bonus', baseMultiplier: 1, color: 'border-rose-600', shadow: 'shadow-rose-600/50' },
];

export default function SpinForm() {
    // Top Slot State
    const [isTopSlotActive, setIsTopSlotActive] = useState<boolean>(false);
    const [topSlotSegment, setTopSlotSegment] = useState<string>('1');
    const [topSlotMultiplier, setTopSlotMultiplier] = useState<string>('50');

    // Main Spin State
    const [selectedSegment, setSelectedSegment] = useState<string>('1');
    const [finalPayout, setFinalPayout] = useState<string>('1');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Auto-Calculate Logic
    useEffect(() => {
        const segmentData = SEGMENTS.find(s => s.name === selectedSegment);
        if (!segmentData) return;

        if (isTopSlotActive && topSlotSegment === selectedSegment) {
            const multiplierValue = parseInt(topSlotMultiplier, 10) || 0;
            if (segmentData.type === 'number') {
                setFinalPayout(multiplierValue.toString());
            } else {
                setFinalPayout('');
            }
        } else {
            if (segmentData.type === 'number') {
                setFinalPayout(segmentData.baseMultiplier.toString());
            } else {
                setFinalPayout('');
            }
        }
    }, [selectedSegment, isTopSlotActive, topSlotSegment, topSlotMultiplier]);

    // 2. Strongly typed event handler
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Ensure finalPayout is a valid number before sending
        const parsedMultiplier = parseInt(finalPayout || '0', 10);
        if (!selectedSegment || parsedMultiplier <= 0) return;

        setIsSubmitting(true);
        try {
            await api.post('/spins', {
                userEmail: "architect@pralayantaka.com",
                gameType: "Crazy Time",
                finalMultiplier: parsedMultiplier,
                result: selectedSegment,
            });

            setSelectedSegment('1');
            setIsTopSlotActive(false);
        } catch (error) {
            console.error('Error saving spin:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700 shadow-xl">

            {/* Top Slot Engine Container */}
            <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/80">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                        Top Slot Engine
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isTopSlotActive}
                            onChange={() => setIsTopSlotActive(!isTopSlotActive)}
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                </div>

                {isTopSlotActive && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
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
                )}
            </div>

            {/* Visual Wheel Segments */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {SEGMENTS.map((segment) => {
                    const isActive = selectedSegment === segment.name;
                    return (
                        <button
                            key={segment.name}
                            type="button"
                            onClick={() => setSelectedSegment(segment.name)}
                            className={`relative overflow-hidden group rounded-xl border-2 transition-all duration-300 h-24 flex items-center justify-center bg-slate-900
                                ${isActive ? `${segment.color} shadow-[0_0_20px_rgba(0,0,0,0.5)] ${segment.shadow} scale-105` : 'border-slate-700/50 hover:border-slate-500 hover:scale-[1.02]'}
                            `}
                        >
                            <div className="z-10 absolute inset-0 p-2 flex items-center justify-center">
                                <Image
                                    src={`/images/${segment.id}.png`}
                                    alt={segment.name}
                                    fill
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className={`object-contain transition-transform duration-300 ${isActive ? 'scale-110' : 'opacity-70 group-hover:opacity-100'}`}
                                    onError={(e) => {
                                        // 3. Safely cast the event target to satisfy TypeScript
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                                <span className="font-black text-xl tracking-wider text-slate-400 group-hover:text-white uppercase drop-shadow-lg text-center z-0">
                                    {segment.name}
                                </span>
                            </div>

                            {isTopSlotActive && topSlotSegment === segment.name && (
                                <div className="absolute top-1 right-1 bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full z-20 shadow-lg animate-bounce">
                                    {topSlotMultiplier}x
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Payout & Submit */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <div className="relative flex-1 group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold tracking-widest uppercase text-sm">Payout</span>
                    <input
                        type="number"
                        value={finalPayout}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFinalPayout(e.target.value)}
                        placeholder="0"
                        className="w-full bg-slate-900/80 border-2 border-slate-700 text-white p-4 pl-24 rounded-xl focus:outline-none focus:border-blue-500 transition-colors font-black text-2xl tracking-tighter"
                        required
                        min="1"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xl">x</span>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || !finalPayout}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-widest py-4 px-10 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 whitespace-nowrap"
                >
                    {isSubmitting ? 'Transmitting...' : 'Log Result'}
                </button>
            </div>
        </form>
    );
}