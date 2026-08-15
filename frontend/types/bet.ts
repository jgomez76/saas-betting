export type Bet = {
    // id: string;
    id: number;
    match: string;
    market: string;
    selection: string;
    odd?: number;
    bookmaker?: string;
    value?: number | null;
    date: string;

    fixture_id?: number;
    
    status: "pending" | "won" | "lost" | "void";
    result?: string;

    stake?: number;
    stake_level?: number;

    league?: string;
    league_id?: number;
}


