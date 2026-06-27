'use client';
import { useState } from 'react';
import { api } from '../lib/api';

const SEGMENTS = [
    { name: '1', type: 'number', baseMultiplier: 1, defaultColor: 'text-blue-400 border-blue-400/30 hover:bg-blue-400/10', activeColor: 'bg-blue-500 text-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]' },
    { name: '2', type: 'number', baseMultiplier: 2, defaultColor: 'text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/10', activeColor: 'bg-yellow-500 text-slate-900 border-yellow-500 font-black shadow-[0_0_15px_rgba(234,179,8,0.4)]' },
    { name: '5', type: 'number', baseMultiplier: 5, defaultColor: 'text-pink-400 border-pink-400/30 hover:bg-pink-400/10', activeColor: 'bg-pink-500 text-white border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]' },
    { name: '10', type: 'number', baseMultiplier: 10, defaultColor: 'text-purple-400 border-purple-400/30 hover:bg-purple-400/10', activeColor: 'bg-purple-500 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' },
    { name: 'Coin Flip', type: 'bonus', defaultColor: 'text-red-400 border-red-400/30 hover:bg-red-400/10', activeColor: 'bg-red-500 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' },
    { name: 'Pachinko', type: 'bonus', defaultColor: 'text-fuchsia-400 border-fuchsia-400/30 hover:bg-fuchsia-400/10', activeColor: 'bg-fuchsia-500 text-white border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.4)]' },
    { name: 'Cash Hunt', type: 'bonus', defaultColor: 'text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10', activeColor: 'bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' },
    { name: 'Crazy Time', type: 'bonus', defaultColor: 'text-rose-500 border-rose-500/30 hover:bg-rose-500/10', activeColor: 'bg-rose-600 text-white border-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.6)]' },
];

export default function SpinForm() {
    const [selectedSegment, setSelectedSegment] = useState<string>('1');
    const [multiplier, setMultiplier] = useState<string>('1');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSegmentSelect = (segment: typeof SEGMENTS[0]) => {
        setSelectedSegment(segment.name);
        // Auto-fill multiplier for numbers, clear for bonuses (unless Top Slot applies, user can manually edit)
        if (segment.type === 'number') {
            setMultiplier(segment.baseMultiplier!.toString());
        } else {
            setMultiplier('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSegment || !multiplier) return;

        setIsSubmitting(true);
        try {
            await api.post('/spins', {
                userEmail: "architect@pralayantaka.com",
                gameType: "Crazy Time",
                finalMultiplier: parseInt(multiplier),
                result: selectedSegment, // Now sending the exact segment name
            });

            // Reset to defaults after successful log
            setSelectedSegment('1');
            setMultiplier('1');
        } catch (error) {
            console.error('Error saving spin:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700 shadow-xl">

            {/* Control Pad Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SEGMENTS.map((segment) => {
                    const isActive = selectedSegment === segment.name;
                    return (
                        <button
                            key={segment.name}
                            type="button"
                            onClick={() => handleSegmentSelect(segment)}
                            className={`py-3 px-2 rounded-xl border-2 transition-all duration-200 font-bold text-sm uppercase tracking-wider 
                                ${isActive ? segment.activeColor : segment.defaultColor}
                                ${isActive ? 'transform scale-[1.02]' : 'opacity-80 hover:opacity-100'}
                            `}
                        >
                            {segment.name}
                        </button>
                    );
                })}
            </div>

            {/* Input & Submit Row */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Payout:</span>
                    <input
                        type="number"
                        value={multiplier}
                        onChange={(e) => setMultiplier(e.target.value)}
                        placeholder="Enter Final Multiplier"
                        className="w-full bg-slate-900 border-2 border-slate-700 text-white p-4 pl-20 rounded-xl focus:outline-none focus:border-blue-500 transition-colors font-black text-xl"
                        required
                        min="1"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">x</span>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || !multiplier}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-10 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 whitespace-nowrap"
                >
                    {isSubmitting ? 'Transmitting...' : 'Log Spin Data'}
                </button>
            </div>
        </form>
    );
}