'use client';
import { useState, useMemo, useEffect, FormEvent, ChangeEvent } from 'react';
import { api } from '../lib/api';
import Image from 'next/image';
import { RefreshCcw, Save, ExternalLink, Trash2 } from 'lucide-react';

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
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const [isNegativeAdjust, setIsNegativeAdjust] = useState<boolean>(false);

    // Auto Save Logic
    const [autoSave, setAutoSave] = useState<boolean>(false);

    useEffect(() => {
        const savedDraft = localStorage.getItem('pralayantaka_draft');
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                setSelectedSegment(parsed.selectedSegment || '1');
                setIsTopSlotActive(parsed.isTopSlotActive || false);
                setTopSlotSegment(parsed.topSlotSegment || '1');
                setTopSlotMultiplier(parsed.topSlotMultiplier || '');
                setCfRed(parsed.cfRed || '');
                setCfBlue(parsed.cfBlue || '');
                setCfWinner(parsed.cfWinner || 'Red');
                setPchHighest(parsed.pchHighest || '');
                setPchEventual(parsed.pchEventual || '');
                setCrowdTotalWin(parsed.crowdTotalWin || '');
                setCrowdPlayers(parsed.crowdPlayers || '');
                setChHighest(parsed.chHighest || '');
                setCtGreen(parsed.ctGreen || '');
                setCtBlue(parsed.ctBlue || '');
                setCtYellow(parsed.ctYellow || '');
                setAutoSave(true);
            } catch (e) {
                console.error("Failed to parse draft", e);
            }
        }
    }, []);

    useEffect(() => {
        if (autoSave) {
            const draft = {
                selectedSegment, isTopSlotActive, topSlotSegment, topSlotMultiplier,
                cfRed, cfBlue, cfWinner, pchHighest, pchEventual,
                crowdTotalWin, crowdPlayers, chHighest, ctGreen, ctBlue, ctYellow
            };
            localStorage.setItem('pralayantaka_draft', JSON.stringify(draft));
        } else {
            localStorage.removeItem('pralayantaka_draft');
        }
    }, [autoSave, selectedSegment, isTopSlotActive, topSlotSegment, topSlotMultiplier, cfRed, cfBlue, cfWinner, pchHighest, pchEventual, crowdTotalWin, crowdPlayers, chHighest, ctGreen, ctBlue, ctYellow]);

    const handleClearEntry = () => {
        setSelectedSegment('1');
        setIsTopSlotActive(false);
        setTopSlotMultiplier('');
        setCfRed(''); setCfBlue('');
        setPchHighest(''); setPchEventual('');
        setCrowdTotalWin(''); setCrowdPlayers(''); setChHighest('');
        setCtGreen(''); setCtBlue(''); setCtYellow('');
        if (autoSave) {
            localStorage.removeItem('pralayantaka_draft');
        }
    };


    const finalCalculatedMultiplier = useMemo(() => {
        const segmentData = SEGMENTS.find(s => s.name === selectedSegment);
        if (!segmentData) return 1;

        if (segmentData.type === 'number') {
            if (isTopSlotActive && topSlotSegment === selectedSegment && topSlotMultiplier) {
                return parseInt(topSlotMultiplier, 10) * segmentData.baseMultiplier;
            }
            return segmentData.baseMultiplier;
        }
        else if (segmentData.type === 'coin-flip') {
            return parseInt(cfWinner === 'Red' ? cfRed : cfBlue, 10) || 0;
        }
        else if (segmentData.type === 'pachinko') {
            return parseInt(pchEventual, 10) || 0;
        }
        else if (segmentData.type === 'cash-hunt' || segmentData.type === 'crazy-time') {
            const win = parseFloat(crowdTotalWin) || 0;
            const players = parseFloat(crowdPlayers) || 1;
            return players > 0 ? Math.round(win / players) : 0;
        }

        return 0;
    }, [selectedSegment, isTopSlotActive, topSlotSegment, topSlotMultiplier, cfRed, cfBlue, cfWinner, pchEventual, crowdTotalWin, crowdPlayers]);

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
            handleClearEntry();
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

            {/* Utility Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-700/50">
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" className="sr-only" checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} />
                        <div className={`w-10 h-5 rounded-full p-1 transition-colors ${autoSave ? 'bg-blue-500' : 'bg-slate-700 group-hover:bg-slate-600'}`}>
                            <div className={`bg-white w-3 h-3 rounded-full shadow-sm transition-transform ${autoSave ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                            <Save className="w-3 h-3" /> Auto-Save Draft
                        </span>
                    </label>
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={handleClearEntry} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-colors border border-red-500/20">
                        <Trash2 className="w-3 h-3" /> Clear Form
                    </button>
                    <button type="button" onClick={() => window.open(window.location.href, '_blank')} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 rounded-lg text-xs font-bold transition-colors border border-slate-600/50">
                        <ExternalLink className="w-3 h-3" /> Popout
                    </button>
                </div>
            </div>

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
                            <label className="text-xs font-bold text-slate-300 mb-1">Target Segment</label>
                            <div className="flex flex-wrap gap-2">
                                {SEGMENTS.map(s => {
                                    return (
                                        <button
                                            key={`ts-seg-${s.name}`}
                                            type="button"
                                            onClick={() => setTopSlotSegment(s.name)}
                                            className={`relative flex-1 min-w-[45px] h-12 rounded-lg transition-all border overflow-hidden ${
                                                topSlotSegment === s.name
                                                    ? 'bg-slate-700 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)] scale-105 z-10'
                                                    : 'bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-slate-500'
                                            }`}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Image
                                                    src={`/images/${s.id}.png`}
                                                    alt={s.name}
                                                    fill sizes="10vw"
                                                    className={`object-contain transition-opacity ${topSlotSegment === s.name ? 'opacity-100' : 'opacity-60'}`}
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
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
                        
                        const GLOW_COLORS: Record<string, string> = {
                            '1': 'rgba(59, 130, 246, 0.8)', // blue
                            '2': 'rgba(234, 179, 8, 0.8)', // yellow
                            '5': 'rgba(236, 72, 153, 0.8)', // pink
                            '10': 'rgba(168, 85, 247, 0.8)', // purple
                            'Coin Flip': 'rgba(239, 68, 68, 0.8)', // red
                            'Pachinko': 'rgba(217, 70, 239, 0.8)', // fuchsia
                            'Cash Hunt': 'rgba(16, 185, 129, 0.8)', // emerald
                            'Crazy Time': 'rgba(225, 29, 72, 0.8)', // rose
                        };

                        return (
                            <button
                                key={segment.name}
                                type="button"
                                role="radio"
                                aria-checked={isActive}
                                onClick={() => setSelectedSegment(segment.name)}
                                className={`relative group rounded-xl transition-all duration-300 aspect-[2/1] flex items-center justify-center bg-transparent focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none
                                    ${isActive ? 'scale-110 z-10' : 'scale-100 opacity-60 hover:opacity-100 hover:scale-105'}
                                `}
                            >
                                <div className="z-10 absolute inset-0 flex items-center justify-center">
                                    <Image
                                        src={`/images/${segment.id}.png`}
                                        alt={`Select ${segment.name}`}
                                        fill sizes="25vw"
                                        className="object-contain"
                                        style={{
                                            filter: isActive ? `drop-shadow(0 0 15px ${GLOW_COLORS[segment.name]})` : 'none',
                                            transition: 'filter 0.3s ease-in-out'
                                        }}
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </fieldset>

            {/* STEP 3: Dynamic Resolution Board (Bonuses Only) */}
            {currentSegmentType !== 'number' && (
                <fieldset className="bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-inner mt-6">
                    <legend className="sr-only">Step 3: Outcome Resolution Configuration</legend>
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-4" aria-hidden="true">Step 3: Bonus Resolution</h3>

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
                        <div className="flex flex-col items-center justify-center bg-slate-800 p-6 rounded-lg">
                            <span className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Winning Side</span>
                            <button
                                type="button"
                                onClick={() => setCfWinner(prev => prev === 'Red' ? 'Blue' : 'Red')}
                                className="relative w-24 h-24 rounded-full focus:outline-none focus:ring-4 focus:ring-white/20"
                                aria-label={`Winning side is ${cfWinner}. Click to flip.`}
                                style={{ perspective: '1000px' }}
                            >
                                <div className="w-full h-full rounded-full transition-transform duration-700 shadow-[0_10px_20px_rgba(0,0,0,0.5)]" style={{ transformStyle: 'preserve-3d', transform: cfWinner === 'Blue' ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                                    {/* Red Side (Front) */}
                                    <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-red-400 to-red-700 flex items-center justify-center border-[6px] border-red-300/50" style={{ backfaceVisibility: 'hidden' }}>
                                        <span className="text-white font-black text-xl drop-shadow-md">RED</span>
                                    </div>
                                    {/* Blue Side (Back) */}
                                    <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center border-[6px] border-blue-300/50" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                        <span className="text-white font-black text-xl drop-shadow-md">BLUE</span>
                                    </div>
                                </div>
                            </button>
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
                    </div>
                )}
                </fieldset>
            )}

            {/* STEP 4: Global Engagement Metrics */}
            <fieldset className="bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-inner mt-6 flex flex-col">
                <legend className="sr-only">Step 4: Global Engagement Metrics Configuration</legend>
                <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest" aria-hidden="true">Step 4: Global Engagement Metrics</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Number of Players */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="global-players" className="text-blue-400 font-bold text-sm uppercase">Number of Players</label>
                            <button type="button" onClick={() => setCrowdPlayers('')} className="text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider font-bold">Clear</button>
                        </div>
                        <input id="global-players" type="number" value={crowdPlayers} onChange={e => setCrowdPlayers(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-blue-400 p-3 rounded-lg font-bold focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none mb-3" placeholder="e.g. 5240" />
                        <div className="flex flex-wrap gap-2">
                            {[10, 50, 100, 500, 1000, 5000].map(val => (
                                <button key={`p-${val}`} type="button" onClick={() => setCrowdPlayers(prev => String(Math.max(0, (parseInt(prev)||0) + (isNegativeAdjust ? -val : val))))} className={`${isNegativeAdjust ? 'bg-red-900/30 hover:bg-red-800/50 text-red-300 border-red-800/50' : 'bg-blue-900/30 hover:bg-blue-800/50 text-blue-300 border-blue-800/50'} text-xs font-bold py-1.5 px-2 rounded border transition-colors`}>{isNegativeAdjust ? '-' : '+'}{val >= 1000 ? `${val/1000}k` : val}</button>
                            ))}
                        </div>
                    </div>

                    {/* Total Win */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="global-total-win" className="text-emerald-400 font-bold text-sm uppercase">Total Win (₹)</label>
                            <button type="button" onClick={() => setCrowdTotalWin('')} className="text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider font-bold">Clear</button>
                        </div>
                        <input id="global-total-win" type="number" value={crowdTotalWin} onChange={e => setCrowdTotalWin(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-emerald-400 p-3 rounded-lg font-bold focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none mb-3" placeholder="e.g. 250000" />
                        <div className="flex flex-wrap gap-2">
                            {[10000, 50000, 100000, 500000, 1000000, 5000000, 10000000].map(val => {
                                let label = val.toString();
                                if (val === 10000000) label = '1Cr';
                                else if (val >= 100000) label = `${val/100000}L`;
                                else if (val >= 1000) label = `${val/1000}k`;
                                return (
                                    <button key={`w-${val}`} type="button" onClick={() => setCrowdTotalWin(prev => String(Math.max(0, (parseInt(prev)||0) + (isNegativeAdjust ? -val : val))))} className={`${isNegativeAdjust ? 'bg-red-900/30 hover:bg-red-800/50 text-red-300 border-red-800/50' : 'bg-emerald-900/30 hover:bg-emerald-800/50 text-emerald-300 border-emerald-800/50'} text-xs font-bold py-1.5 px-2 rounded border transition-colors`}>{isNegativeAdjust ? '-' : '+'}{label}</button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-center">
                    <button 
                        type="button" 
                        onClick={() => setIsNegativeAdjust(!isNegativeAdjust)} 
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-colors border shadow-lg ${isNegativeAdjust ? 'bg-red-900/40 hover:bg-red-900/60 text-red-400 border-red-500/50' : 'bg-blue-900/40 hover:bg-blue-900/60 text-blue-400 border-blue-500/50'}`}
                    >
                        <span>[+/-] Flip to {isNegativeAdjust ? 'Subtract' : 'Add'}</span>
                    </button>
                </div>
            </fieldset>

            {/* Submission Block */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                <div className="flex items-center gap-3 bg-slate-800 rounded-lg p-3 w-full sm:w-auto border border-slate-600">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest whitespace-nowrap">Average Multiplier for the round:</span>
                    <span className="text-xl font-black text-white">{finalCalculatedMultiplier}x</span>
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