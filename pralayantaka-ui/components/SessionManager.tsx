'use client';
import { useState, useEffect, useMemo } from 'react';
import type { SpinRecord } from '../lib/types';

interface SessionManagerProps {
    data: SpinRecord[] | undefined;
}

interface Session {
    id: string;
    startTime: string;
    endTime: string | null;
}

export default function SessionManager({ data }: SessionManagerProps) {
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [sessionHistory, setSessionHistory] = useState<Session[]>([]);

    useEffect(() => {
        const savedCurrent = localStorage.getItem('pralayantaka_current_session');
        if (savedCurrent) setCurrentSession(JSON.parse(savedCurrent));
        
        const savedHistory = localStorage.getItem('pralayantaka_session_history');
        if (savedHistory) setSessionHistory(JSON.parse(savedHistory));
    }, []);

    const handleStartSession = () => {
        const newSession = {
            id: Date.now().toString(),
            startTime: new Date().toISOString(),
            endTime: null
        };
        setCurrentSession(newSession);
        localStorage.setItem('pralayantaka_current_session', JSON.stringify(newSession));
    };

    const handleEndSession = () => {
        if (!currentSession) return;
        
        const endedSession = { ...currentSession, endTime: new Date().toISOString() };
        const newHistory = [endedSession, ...sessionHistory].slice(0, 5);
        
        setSessionHistory(newHistory);
        setCurrentSession(null);
        
        localStorage.removeItem('pralayantaka_current_session');
        localStorage.setItem('pralayantaka_session_history', JSON.stringify(newHistory));
    };

    const currentStats = useMemo(() => {
        if (!data || !currentSession) return null;
        
        const startTime = new Date(currentSession.startTime).getTime();
        const sessionSpins = data.filter(s => new Date(s.timestamp).getTime() >= startTime);
        
        if (sessionSpins.length === 0) return { spins: 0, avgMult: 0, bestMult: 0 };

        let sumMult = 0;
        let bestMult = 0;
        
        sessionSpins.forEach(s => {
            sumMult += s.finalMultiplier;
            if (s.finalMultiplier > bestMult) bestMult = s.finalMultiplier;
        });
        
        return {
            spins: sessionSpins.length,
            avgMult: sumMult / sessionSpins.length,
            bestMult
        };
    }, [data, currentSession]);

    return (
        <div className="w-full bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6">Session Tracker</h3>
            
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 mb-6">
                {currentSession ? (
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                            <div>
                                <div className="text-emerald-400 font-bold">Active Session</div>
                                <div className="text-xs text-slate-400">Started: {new Date(currentSession.startTime).toLocaleTimeString()}</div>
                            </div>
                        </div>
                        
                        <div className="flex gap-6 text-center">
                            <div>
                                <div className="text-xs text-slate-500 uppercase font-bold">Spins</div>
                                <div className="text-xl font-black text-white">{currentStats?.spins || 0}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 uppercase font-bold">Avg Mult</div>
                                <div className="text-xl font-black text-blue-400">{currentStats?.avgMult.toFixed(1) || 0}x</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 uppercase font-bold">Best Win</div>
                                <div className="text-xl font-black text-yellow-400">{currentStats?.bestMult || 0}x</div>
                            </div>
                        </div>
                        
                        <button 
                            onClick={handleEndSession}
                            className="bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 border border-rose-500/50 font-bold px-6 py-2 rounded-lg transition-colors"
                        >
                            End Session
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-slate-400 text-sm">No active tracking session. Start one to track isolated performance.</div>
                        <button 
                            onClick={handleStartSession}
                            className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 border border-emerald-500/50 font-bold px-6 py-2 rounded-lg transition-colors whitespace-nowrap"
                        >
                            Start Session
                        </button>
                    </div>
                )}
            </div>
            
            {sessionHistory.length > 0 && (
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Previous Sessions</h4>
                    <div className="space-y-2">
                        {sessionHistory.map(session => (
                            <div key={session.id} className="flex justify-between items-center bg-slate-800/30 rounded-lg p-3 border border-slate-700/30 text-sm">
                                <span className="text-slate-400">
                                    {new Date(session.startTime).toLocaleDateString()} {new Date(session.startTime).toLocaleTimeString()} 
                                    {' '}—{' '} 
                                    {session.endTime ? new Date(session.endTime).toLocaleTimeString() : 'Unknown'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
