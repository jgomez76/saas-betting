export type Bet = {
    id: string;
    match: string;
    market: string;
    selection: string;
    odd?: number;
    bookmaker?: string;
    value?: number | null;
    date: string;

    fixture_id?: number;
    
    status: "pending" | "won" | "lost";
    result?: string;
}