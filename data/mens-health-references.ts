// Evidence-based reference values and scoring logic for Men's Health Analytics
// Based on WHO 6th edition (2021) and Canadian population health data

import {
    HealthReferenceRanges,
    MensHealthCardData,
    SemenQualityMetrics,
    LifestyleMetrics,
    MetricStatus,
    SmokingStatus,
    AlcoholRiskLevel,
    DietQuality,
} from '../types/mens-health-types';

// WHO 6th edition (2021) reference values - 5th percentile lower limits
// Source: WHO laboratory manual for the examination and processing of human semen (2021)
export const WHO_REFERENCE_VALUES = {
    spermConcentration: 16, // million/mL (5th percentile)
    totalSpermCount: 39, // million per ejaculate (5th percentile)
    progressiveMotility: 30, // % (5th percentile)
    totalMotility: 42, // % (5th percentile)
    normalMorphology: 4, // % (5th percentile)
    semenVolume: 1.4, // mL (5th percentile)
};

// Canadian health guidelines and population data
// Sources: Canadian 24-Hour Movement Guidelines, CCHS data
export const CANADIAN_LIFESTYLE_REFERENCES = {
    minimumSleepHours: 7, // Adults should get 7-9 hours
    optimalSleepHours: 8,
    minimumExerciseMinutes: 150, // Moderate to vigorous physical activity per week
    optimalExerciseMinutes: 300,
    heavyDrinkingPrevalence: 0.20, // ~20% of Canadian men report heavy drinking
};

// Complete reference ranges for all metrics
export const HEALTH_REFERENCE_RANGES: HealthReferenceRanges = {
    semen: {
        spermConcentration: {
            below: 16,
            within: [16, 200],
            optimal: 50,
        },
        totalSpermCount: {
            below: 39,
            within: [39, 500],
            optimal: 150,
        },
        progressiveMotility: {
            below: 30,
            within: [30, 100],
            optimal: 50,
        },
        totalMotility: {
            below: 42,
            within: [42, 100],
            optimal: 65,
        },
        normalMorphology: {
            below: 4,
            within: [4, 100],
            optimal: 10,
        },
        semenVolume: {
            below: 1.4,
            within: [1.4, 7.0],
            optimal: 3.5,
        },
    },
    lifestyle: {
        sleepHours: {
            below: 7,
            within: [7, 9],
            optimal: 8,
        },
        weeklyExercise: {
            below: 150,
            within: [150, 500],
            optimal: 300,
        },
    },
};

// Classify a numeric value against its reference range
export function classifyMetric(value: number, range: { below: number; within: [number, number] }): MetricStatus {
    if (value < range.below) return 'below';
    if (value >= range.within[0] && value <= range.within[1]) return 'within';
    return 'above';
}

// Calculate semen quality score (0-100)
// Weighted average of all semen parameters
export function calculateSemenQualityScore(semen: SemenQualityMetrics): number {
    const weights = {
        spermConcentration: 0.20, // 20%
        totalSpermCount: 0.20, // 20%
        progressiveMotility: 0.20, // 20%
        totalMotility: 0.15, // 15%
        normalMorphology: 0.15, // 15%
        semenVolume: 0.10, // 10%
    };

    // Normalize each metric to 0-100 scale
    const normalizeToRange = (value: number, ref: { below: number; within: [number, number]; optimal?: number }) => {
        const optimal = ref.optimal || ref.within[1];
        if (value >= optimal) return 100;
        if (value <= 0) return 0;
        // Linear scaling from 0 to optimal
        return Math.min(100, (value / optimal) * 100);
    };

    const refs = HEALTH_REFERENCE_RANGES.semen;

    const scores = {
        spermConcentration: normalizeToRange(semen.spermConcentration, refs.spermConcentration),
        totalSpermCount: normalizeToRange(semen.totalSpermCount, refs.totalSpermCount),
        progressiveMotility: normalizeToRange(semen.progressiveMotility, refs.progressiveMotility),
        totalMotility: normalizeToRange(semen.totalMotility, refs.totalMotility),
        normalMorphology: normalizeToRange(semen.normalMorphology, refs.normalMorphology),
        semenVolume: normalizeToRange(semen.semenVolume, refs.semenVolume),
    };

    return (
        scores.spermConcentration * weights.spermConcentration +
        scores.totalSpermCount * weights.totalSpermCount +
        scores.progressiveMotility * weights.progressiveMotility +
        scores.totalMotility * weights.totalMotility +
        scores.normalMorphology * weights.normalMorphology +
        scores.semenVolume * weights.semenVolume
    );
}

// Calculate lifestyle score (0-100)
// Weighted average of lifestyle factors
export function calculateLifestyleScore(lifestyle: LifestyleMetrics): number {
    const weights = {
        smoking: 0.25, // 25%
        alcohol: 0.20, // 20%
        sleep: 0.25, // 25%
        exercise: 0.20, // 20%
        diet: 0.10, // 10%
    };

    // Smoking score (0-100)
    const smokingScore = {
        'non-smoker': 100,
        'occasional': 50,
        'daily': 0,
    }[lifestyle.smokingStatus];

    // Alcohol score (0-100)
    const alcoholScore = {
        'low': 100,
        'moderate': 60,
        'high': 20,
    }[lifestyle.alcoholRiskLevel];

    // Sleep score (0-100)
    const sleepScore = (() => {
        const hours = lifestyle.sleepHoursPerNight;
        const ref = HEALTH_REFERENCE_RANGES.lifestyle.sleepHours;
        if (hours >= ref.optimal!) return 100;
        if (hours < ref.below) return Math.max(0, (hours / ref.below) * 50);
        return 50 + ((hours - ref.below) / (ref.optimal! - ref.below)) * 50;
    })();

    // Exercise score (0-100)
    const exerciseScore = (() => {
        const minutes = lifestyle.weeklyExerciseMinutes;
        const ref = HEALTH_REFERENCE_RANGES.lifestyle.weeklyExercise;
        if (minutes >= ref.optimal!) return 100;
        if (minutes < ref.below) return (minutes / ref.below) * 50;
        return 50 + ((minutes - ref.below) / (ref.optimal! - ref.below)) * 50;
    })();

    // Diet score (0-100)
    const dietScore = {
        'good': 100,
        'fair': 60,
        'poor': 30,
    }[lifestyle.dietQuality];

    return (
        smokingScore * weights.smoking +
        alcoholScore * weights.alcohol +
        sleepScore * weights.sleep +
        exerciseScore * weights.exercise +
        dietScore * weights.diet
    );
}

// Calculate overall Men's Health Index (0-100)
// 60% semen quality + 40% lifestyle
export function calculateOverallHealthIndex(semenScore: number, lifestyleScore: number): number {
    return Math.round(semenScore * 0.6 + lifestyleScore * 0.4);
}

// Get risk level based on overall health index
export function getRiskLevel(healthIndex: number): 'Low' | 'Moderate' | 'High' {
    if (healthIndex >= 70) return 'Low';
    if (healthIndex >= 50) return 'Moderate';
    return 'High';
}

// Get risk level color (monochrome)
export function getRiskLevelColor(riskLevel: 'Low' | 'Moderate' | 'High'): string {
    switch (riskLevel) {
        case 'Low':
            return '#000000'; // Black
        case 'Moderate':
            return '#666666'; // Medium grey
        case 'High':
            return '#3A3A3A'; // Dark grey
    }
}

// Get status color for UI (monochrome scheme)
export function getStatusColor(status: MetricStatus): string {
    switch (status) {
        case 'within':
        case 'above':
            return '#000000'; // Black for good
        case 'below':
            return '#666666'; // Grey for needs attention
    }
}

// Get comparison label for a semen metric
export function getSemenComparisonLabel(value: number, metricName: keyof typeof HEALTH_REFERENCE_RANGES.semen): string {
    const range = HEALTH_REFERENCE_RANGES.semen[metricName];
    const status = classifyMetric(value, range);

    if (status === 'below') return 'Below WHO reference';
    if (status === 'within') return 'Within WHO reference';
    return 'Above WHO reference';
}

// Calculate complete health card data
export function calculateHealthCardData(
    semen: SemenQualityMetrics,
    lifestyle: LifestyleMetrics,
    notes?: string
): Omit<MensHealthCardData, 'id' | 'createdAt'> {
    const semenQualityScore = calculateSemenQualityScore(semen);
    const lifestyleScore = calculateLifestyleScore(lifestyle);
    const overallHealthIndex = calculateOverallHealthIndex(semenQualityScore, lifestyleScore);

    return {
        semenQuality: semen,
        lifestyle,
        notes,
        overallHealthIndex,
        semenQualityScore,
        lifestyleScore,
    };
}
