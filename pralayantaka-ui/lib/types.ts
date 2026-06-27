export interface SpinRecord {
    id: number;
    userEmail: string;
    gameType: string;
    topSlotSegment: string | null;
    topSlotMultiplier: number | null;
    result: string;
    finalMultiplier: number;
    numberOfPlayers: number;
    totalWinningAmount: number;
    gameSpecificData: string | null;
    timestamp: string;
}

export interface CoinFlipData {
    redMultiplier: number;
    blueMultiplier: number;
    winner: 'Red' | 'Blue';
}

export interface PachinkoData {
    highestAvailable: number;
    eventualMultiplier: number;
}

export interface CashHuntData {
    highestPossible: number;
    totalWin: number;
    numberOfPlayers: number;
}

export interface CrazyTimeData {
    greenFlap: number;
    blueFlap: number;
    yellowFlap: number;
    totalWin: number;
    numberOfPlayers: number;
}

export type GameSpecificData = CoinFlipData | PachinkoData | CashHuntData | CrazyTimeData;
