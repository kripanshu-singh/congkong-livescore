/**
 * Calculates the final score based on the selected method.
 * @param {number[]} scores - Array of total scores from each judge.
 * @param {string} method - 'avg' | 'trimmed' | 'sum'
 * @returns {number} - The calculated final score (fixed to 2 decimals).
 */
export function calculateFinalScore(scores, method = 'avg') {
    const n = scores.length;
    
    // Handle edge case: No scores available
    if (n === 0) return 0;

    const sum = scores.reduce((a, b) => a + b, 0);
    let result = 0;

    switch (method) {
        case 'sum': // 3. Total Sum
            result = sum;
            break;

        case 'trimmed': // 2. Trimmed Mean (Olympic)
            if (n >= 3) {
                const max = Math.max(...scores);
                const min = Math.min(...scores);
                // Subtract max and min, then divide by remaining count
                result = (sum - max - min) / (n - 2);
            } else {
                // Fallback to Arithmetic Mean if judges < 3
                result = sum / n;
            }
            break;

        case 'avg': // 1. Arithmetic Mean (Default)
        default:
            result = sum / n;
            break;
    }

    // Return rounded to 2 decimal places
    return parseFloat(result.toFixed(2));
}

/**
 * Calculates Final Score based on Voting Integration Mode
 * @param {number} judgeResult - The calculated score from judges
 * @param {number} audienceScore - The raw audience score (0-100)
 * @param {object} settings - Admin configuration object containing voteMode, voteRatio, rankBonus1, etc.
 * @param {number} audienceRank - The team's rank in audience voting (1, 2, 3...)
 */
export function calculateTotalWithVoting(judgeResult, audienceScore, settings, audienceRank) {
    let finalScore = 0;
    // Default to judge result if no valid settings
    if (!settings) return judgeResult;

    switch (settings.voteMode) {
        case 'ratio': // Mode 2: Weighted Ratio
            const ratio = settings.voteRatio || 0;
            const audWeight = ratio / 100;     // e.g., 20% -> 0.2
            const judgeWeight = (100 - ratio) / 100; // e.g., 80% -> 0.8
            
            // Validate inputs
            const safeJudge = judgeResult || 0;
            const safeAud = audienceScore || 0;

            finalScore = (safeJudge * judgeWeight) + (safeAud * audWeight);
            break;

        case 'rank': // Mode 3: Rank Bonus
            let bonus = 0;
            if (audienceRank === 1) bonus = parseInt(settings.rankBonus1 || 0);
            else if (audienceRank === 2) bonus = parseInt(settings.rankBonus2 || 0);
            else if (audienceRank === 3) bonus = parseInt(settings.rankBonus3 || 0);
            else bonus = parseInt(settings.rankBonusOther || 0);

            finalScore = judgeResult + bonus;
            break;

        case 'none': // Mode 1: None
        default:
            finalScore = judgeResult;
            break;
    }

    // Always return rounded to 2 decimal places
    return parseFloat(finalScore.toFixed(2));
}
