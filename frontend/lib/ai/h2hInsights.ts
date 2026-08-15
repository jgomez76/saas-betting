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

type AIInsights = {
    insights: Insight[];
};

type H2HInsight = {
    icon: string;
    title: string;
    text: string;
};

export function buildH2HInsights(
    ai: AIInsights | undefined,
    t: Translation,
): H2HInsight[] {

    const result: H2HInsight[] = [];

    if (!ai?.insights) {
        return result;
    }

    for (const insight of ai.insights) {

        switch (insight.type) {

            // ---------------------------------
            // DOMINANCE
            // ---------------------------------

            case "dominance":

                if (insight.subtype === "weakening") {

                    result.push({

                        icon: "🏠",

                        title: t.aiDominanceWeakeningTitle,

                        text: format(
                            t.aiDominanceWeakening,
                            {
                                team: String(
                                    insight.data.team ?? ""
                                ),
                            }
                        ),

                    });

                }

                break;

            // ---------------------------------
            // GOAL TREND
            // ---------------------------------

            case "goal_trend":

                if (insight.subtype === "goals_increasing") {

                    result.push({

                        icon: "⚽",

                        title: t.aiGoalTrendTitle,

                        text: format(
                            t.aiGoalsIncreasing,
                            {
                                historical: Number(
                                    insight.data.historical ?? 0
                                ),
                                recent: Number(
                                    insight.data.recent ?? 0
                                ),
                            }
                        ),

                    });

                }

                else if (insight.subtype === "goals_decreasing") {

                    result.push({

                        icon: "⚽",

                        title: t.aiGoalTrendTitle,

                        text: format(
                            t.aiGoalsDecreasing,
                            {
                                historical: Number(
                                    insight.data.historical ?? 0
                                ),
                                recent: Number(
                                    insight.data.recent ?? 0
                                ),
                            }
                        ),

                    });

                }

                break;

            // ---------------------------------
            // MARKET
            // ---------------------------------

            case "market":

                if (insight.subtype === "btts_increasing") {

                    result.push({

                        icon: "🎯",

                        title: t.aiBTTSIncreasingTitle,

                        text: format(
                            t.aiBTTSIncreasing,
                            {
                                recent5: Number(
                                    insight.data.recent5 ?? 0
                                ),
                            }
                        ),

                    });

                }

                else if (insight.subtype === "btts_decreasing") {

                    result.push({

                        icon: "🎯",

                        title: t.aiBTTSIncreasingTitle,

                        text: format(
                            t.aiBTTSDecreasing,
                            {
                                recent5: Number(
                                    insight.data.recent5 ?? 0
                                ),
                            }
                        ),

                    });

                }

                else if (insight.subtype === "over_increasing") {

                    result.push({

                        icon: "📈",

                        title: t.aiOverTrendTitle,

                        text: format(
                            t.aiOverIncreasing,
                            {
                                recent5: Number(
                                    insight.data.recent5 ?? 0
                                ),
                            }
                        ),

                    });

                }

                else if (insight.subtype === "over_decreasing") {

                    result.push({

                        icon: "📉",

                        title: t.aiOverTrendTitle,

                        text: t.aiOverDecreasing,

                    });

                }

                break;

            // ---------------------------------
            // DEFENCE
            // ---------------------------------

            case "defence":

                if (insight.subtype === "clean_sheets") {

                    result.push({

                        icon: "🛡️",

                        title: t.aiCleanSheetsTitle,

                        text: format(
                            t.aiCleanSheets,
                            {
                                matches: Number(
                                    insight.data.matches ?? 0
                                ),
                                total: Number(
                                    insight.data.total ?? 0
                                ),
                            }
                        ),

                    });

                }

                break;

            // ---------------------------------
            // ATTACK
            // ---------------------------------

            case "attack":

                result.push({

                    icon: "⚔️",

                    title: t.aiAttackTrendTitle,

                    text: format(
                        t.aiTeamStoppedScoring,
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

                break;

            // ---------------------------------
            // DRAWS
            // ---------------------------------

            case "draws":

                result.push({

                    icon: "🤝",

                    title: t.aiDrawTrendTitle,

                    text: t.aiFrequentDraws,

                });

                break;

            // ---------------------------------
            // GENERAL
            // ---------------------------------

            case "general":

                if (
                    insight.subtype ===
                    "no_clear_pattern"
                ) {

                    result.push({

                        icon: "🧠",

                        title: t.aiNoClearPatternTitle,

                        text: t.aiNoClearPattern,

                    });

                }

                break;
                
            // ---------------------------------
            // COMPOSITE
            // ---------------------------------

            case "composite":

                if (
                    insight.subtype ===
                    "open_matches"
                ) {

                    result.push({

                        icon: "🔥",

                        title: t.aiOpenMatchesTitle,

                        text: t.aiOpenMatches,

                    });

                }

                else if (
                    insight.subtype ===
                    "dominance_with_more_goals"
                ) {

                    result.push({

                        icon: "🧠",

                        title: t.aiCompositeTitle,

                        text: t.aiCompositeDominanceGoals,

                    });

                }

                break;

        }

    }

    return result;

}