/**
 * ==========================================================
 * 💎 LURANIX PREMIUM ENGINE
 * ==========================================================
 *
 * Single source of truth for every Premium permission.
 * Never check isPremium directly inside components.
 *
 * Example:
 *
 * canUseTheme(isPremium)
 * canUseAI(isPremium)
 * canUseAdvancedStats(isPremium)
 *
 */

export function canUseTheme(isPremium: boolean): boolean {
    return isPremium;
}

export function canUseAI(isPremium: boolean): boolean {
    return isPremium;
}

export function canUseAdvancedStats(isPremium: boolean): boolean {
    return isPremium;
}

export function canUseUnlimitedFavorites(isPremium: boolean): boolean {
    return isPremium;
}

export function canExportData(isPremium: boolean): boolean {
    return isPremium;
}