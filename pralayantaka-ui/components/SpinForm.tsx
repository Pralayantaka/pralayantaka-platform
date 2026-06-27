'use client';
import { useState } from 'react';
import { api } from '../lib/api'; // Updated path


export default function SpinForm() {
    const [multiplier, setMultiplier] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/spins', {
                userEmail: "architect@pralayantaka.com",
                gameType: "Crazy Time",
                finalMultiplier: parseInt(multiplier),
                result: "Crazy Time",
            });
            setMultiplier(''); // Clear the form after success
        } catch (error) {
            console.error('Error saving spin:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 p-6 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 shadow-xl">
            <input
                type="number"
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
                placeholder="Enter Multiplier (e.g., 50)"
                className="flex-1 bg-slate-900 border border-slate-700 text-white p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-500 font-medium"
                required
            />
            <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
                {isSubmitting ? 'Logging...' : 'Log Spin Data'}
            </button>
        </form>
    );
}