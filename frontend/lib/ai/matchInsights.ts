import { format } from "@/lib/i18n/format";
import type { Translation } from "@/lib/i18n";

type Insight = {
    score: number;
    type: string;
    subtype: string;
    priority: string;
    category: string;
    data: Record<string, unknown>;
};

type MatchInsight = {
    icon: string;
    title: string;
    text: string;
};

export function buildMatchInsights(
    insights: Insight[],
    t: Translation,
): MatchInsight[] {

    const result: MatchInsight[] = [];

    for (const insight of insights) {

        switch (insight.type) {

            case "attack":

                if (insight.subtype === "home_scoring") {

                    result.push({

                        icon: "⚔️",

                        title: t.matchAttackTitle,

                        text: format(

                            t.matchHomeScoring,

                            {

                                team: String(
                                    insight.data.team ?? ""
                                ),

                                avg_goals: Number(
                                    insight.data.avg_goals ?? 0
                                ),

                            }

                        ),

                    });

                }

                break;
            case "defence":

                if (insight.subtype === "away_conceding") {

                    result.push({

                        icon: "🛡️",

                        title: t.matchDefenceTitle,

                        text: format(

                            t.matchAwayConceding,

                            {

                                team: String(
                                    insight.data.team ?? ""
                                ),

                                avg_goals: Number(
                                    insight.data.avg_goals ?? 0
                                ),

                            }

                        ),

                    });

                }

                break;
            case "market":

                if (insight.subtype === "home_over25") {

                    result.push({

                        icon: "📈",

                        title: t.matchMarketTitle,

                        text: format(

                            t.matchHomeOver25,

                            {

                                team: String(
                                    insight.data.team ?? ""
                                ),

                                over25: Number(
                                    insight.data.over25 ?? 0
                                ),

                            }

                        ),

                    });

                }

                else if (insight.subtype === "away_btts") {

                    result.push({

                        icon: "🎯",

                        title: t.matchMarketTitle,

                        text: format(

                            t.matchAwayBTTS,

                            {

                                team: String(
                                    insight.data.team ?? ""
                                ),

                                btts: Number(
                                    insight.data.btts ?? 0
                                ),

                            }

                        ),

                    });

                }

                break;
            case "h2h":

                if (insight.subtype === "over25") {

                    result.push({

                        icon: "⚔️",

                        title: t.matchH2HTitle,

                        text: format(

                            t.matchH2HOver25,

                            {

                                over25: Number(
                                    insight.data.over25 ?? 0
                                ),

                            }

                        ),

                    });

                }

                else if (insight.subtype === "btts") {

                    result.push({

                        icon: "🤝",

                        title: t.matchH2HTitle,

                        text: format(

                            t.matchH2HBTTS,

                            {

                                btts: Number(
                                    insight.data.btts ?? 0
                                ),

                            }

                        ),

                    });

                }

                break;
            
            case "general":

                if (
                    insight.subtype ===
                    "no_clear_pattern"
                ) {

                    result.push({

                        icon: "🧠",

                        title: t.matchNoClearPatternTitle,

                        text: t.matchNoClearPattern,

                    });

                }

                break;
            case "composite":

                if (insight.subtype === "combined_over25") {

                    result.push({

                        icon: "🧠",

                        title: t.matchCompositeTitle,

                        text: t.matchCombinedOver25,

                    });

                }

                else if (insight.subtype === "combined_btts") {

                    result.push({

                        icon: "🧠",

                        title: t.matchCompositeTitle,

                        text: t.matchCombinedBTTS,

                    });

                }

    break;

            case "streak":

                if (insight.subtype === "home_winning") {

                    result.push({

                        icon: "🔥",

                        title: t.matchStreakTitle,

                        text: format(

                            t.matchHomeWinningStreak,

                            {

                                team: String(
                                    insight.data.team ?? ""
                                ),

                                matches: Number(
                                    insight.data.matches ?? 0
                                ),

                            }

                        ),

                    });

                }

                else if (insight.subtype === "away_winning") {

                    result.push({

                        icon: "🔥",

                        title: t.matchStreakTitle,

                        text: format(

                            t.matchAwayWinningStreak,

                            {

                                team: String(
                                    insight.data.team ?? ""
                                ),

                                matches: Number(
                                    insight.data.matches ?? 0
                                ),

                            }

                        ),

                    });

                }

                break;

        }

    }

    return result;

}