// Men's Health Card Type Definitions
// Evidence-based metrics for semen quality and lifestyle factors

export type SmokingStatus = 'non-smoker' | 'occasional' | 'daily';
export type AlcoholRiskLevel = 'low' | 'moderate' | 'high';
export type DietQuality = 'poor' | 'fair' | 'good';
export type MetricStatus = 'below' | 'within' | 'above';

// Semen quality metrics based on WHO 6th edition (2021)
export interface SemenQualityMetrics {
    spermConcentration: number; // million/mL
    totalSpermCount: number; // million per ejaculate
    progressiveMotility: number; // %
    totalMotility: number; // %
    normalMorphology: number; // %
    semenVolume: number; // mL
}

// Lifestyle metrics based on Canadian health data
export interface LifestyleMetrics {
    smokingStatus: SmokingStatus;
    alcoholRiskLevel: AlcoholRiskLevel;
    sleepHoursPerNight: number;
    weeklyExerciseMinutes: number;
    dietQuality: DietQuality;
}

// Complete Men's Health Card data
export interface MensHealthCardData {
    id: string;
    createdAt: string; // ISO date string
    name?: string; // User's name
    height?: number; // cm
    weight?: number; // kg
    semenQuality: SemenQualityMetrics;
    lifestyle: LifestyleMetrics;
    notes?: string;
    overallHealthIndex: number; // 0-100
    semenQualityScore: number; // 0-100
    lifestyleScore: number; // 0-100
}

// Status indicator for each metric
export interface MetricIndicator {
    value: number | string;
    status: MetricStatus;
    label: string;
    color: string;
}

// Reference ranges for classification
export interface ReferenceRange {
    below: number;
    within: [number, number];
    optimal?: number;
}

export interface HealthReferenceRanges {
    semen: {
        spermConcentration: ReferenceRange; // WHO: ≥16 million/mL
        totalSpermCount: ReferenceRange; // WHO: ≥39 million
        progressiveMotility: ReferenceRange; // WHO: ≥30%
        totalMotility: ReferenceRange; // WHO: ≥42%
        normalMorphology: ReferenceRange; // WHO: ≥4%
        semenVolume: ReferenceRange; // WHO: ≥1.4 mL
    };
    lifestyle: {
        sleepHours: ReferenceRange; // Canadian: ≥7 hours
        weeklyExercise: ReferenceRange; // Canadian: ≥150 minutes
    };
}
