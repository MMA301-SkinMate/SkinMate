const { SKIN_DICTIONARY, CONDITION_DICTIONARY, CONFLICT_MATRIX } = require('../models/SkinDictionary');

const calculateProductScores = ({
    ingredients = [],
    skinType = 'Da_Thuong',
    todayCondition = 'Binh_Thuong',
    routineIngredients = []
}) => {
    const skinData = SKIN_DICTIONARY[skinType] || SKIN_DICTIONARY.Da_Thuong;
    const conditionData = CONDITION_DICTIONARY[todayCondition] || CONDITION_DICTIONARY.Binh_Thuong;

    // Base Score
    let baseScore = 70;

    ingredients.forEach(ing => {
        if (!ing || typeof ing !== 'string') return;
        const matchIng = ing.toLowerCase();

        // Check Do's
        const isDo = skinData.dos.some(d => matchIng.includes(d.toLowerCase()));
        if (isDo) baseScore += 10;

        // Check Don'ts
        const isDont = skinData.donts.some(d => matchIng.includes(d.toLowerCase()));
        if (isDont) baseScore -= 15;
    });

    const finalBaseScore = Math.min(100, Math.max(0, baseScore));

    let contextualScore = finalBaseScore;

    ingredients.forEach(ing => {
        if (!ing || typeof ing !== 'string') return;
        const matchIng = ing.toLowerCase();

        // Check Treatment
        const isTreatment = conditionData.treatment.some(t => matchIng.includes(t.toLowerCase()));
        if (isTreatment) contextualScore += 20;

        // Check Taboo
        const isTaboo = conditionData.taboo.some(t => matchIng.includes(t.toLowerCase()));
        if (isTaboo) contextualScore -= 30;

        // Check Routine Conflict
        routineIngredients.forEach(routineIng => {
            if (!routineIng || typeof routineIng !== 'string') return;
            const cleanRoutineIng = routineIng.toLowerCase();
            Object.keys(CONFLICT_MATRIX).forEach(key => {
                if (matchIng.includes(key.toLowerCase())) {
                    const conflicts = CONFLICT_MATRIX[key].conflictsWith;
                    const hasConflict = conflicts.some(c => cleanRoutineIng.includes(c.toLowerCase()));
                    if (hasConflict) {
                        contextualScore -= 40;
                    }
                }
            });
        });
    });

    const finalContextualScore = Math.min(100, Math.max(0, contextualScore));

    return {
        baseScore: finalBaseScore,
        contextualScore: finalContextualScore
    };
};

module.exports = {
    calculateProductScores,
};