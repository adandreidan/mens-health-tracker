// Men's Health Card Component with 3D Flip Animation
// Front: Summary with Overall Health Index
// Back: Detailed breakdown of all metrics

import React, { useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../constants/design-system';
import {
    HEALTH_REFERENCE_RANGES,
    classifyMetric,
    getRiskLevel,
    getRiskLevelColor,
    getSemenComparisonLabel,
    getStatusColor,
} from '../data/mens-health-references';
import { MensHealthCardData } from '../types/mens-health-types';

interface MensHealthCardProps {
    card: MensHealthCardData;
    isSelected?: boolean;
    onSelect?: (cardId: string) => void;
    showSelectionIndicator?: boolean;
    onDelete?: (cardId: string) => void;
    showDeleteButton?: boolean;
}

export default function MensHealthCard({ card, isSelected = false, onSelect, showSelectionIndicator = false, onDelete, showDeleteButton = false }: MensHealthCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [flipAnim] = useState(new Animated.Value(0));

    const handleFlip = () => {
        const toValue = isFlipped ? 0 : 180;
        Animated.timing(flipAnim, {
            toValue,
            duration: 600,
            useNativeDriver: true,
        }).start();
        setIsFlipped(!isFlipped);
    };

    const frontInterpolate = flipAnim.interpolate({
        inputRange: [0, 180],
        outputRange: ['0deg', '180deg'],
    });

    const backInterpolate = flipAnim.interpolate({
        inputRange: [0, 180],
        outputRange: ['180deg', '360deg'],
    });

    const frontOpacity = flipAnim.interpolate({
        inputRange: [0, 90, 90.01, 180],
        outputRange: [1, 1, 0, 0],
    });

    const backOpacity = flipAnim.interpolate({
        inputRange: [0, 90, 90.01, 180],
        outputRange: [0, 0, 1, 1],
    });

    const riskLevel = getRiskLevel(card.overallHealthIndex);
    const riskColor = getRiskLevelColor(riskLevel);
    const formattedDate = new Date(card.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    const handlePress = () => {
        if (showSelectionIndicator && onSelect) {
            onSelect(card.id);
        } else {
            handleFlip();
        }
    };

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={styles.container}>
            {/* Selection Indicator */}
            {showSelectionIndicator && (
                <View style={[styles.selectionIndicator, isSelected && styles.selectionIndicatorSelected]}>
                    <Text style={[styles.selectionIndicatorText, isSelected && styles.selectionIndicatorTextSelected]}>
                        {isSelected ? '✓' : ''}
                    </Text>
                </View>
            )}

            {/* Delete Button */}
            {showDeleteButton && onDelete && (
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDelete(card.id)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.deleteButtonText}>✕</Text>
                </TouchableOpacity>
            )}

            {/* Front Side */}
            <Animated.View
                style={[
                    styles.card,
                    styles.cardFront,
                    {
                        opacity: frontOpacity,
                        transform: [{ rotateY: frontInterpolate }],
                    },
                ]}
            >
                <View style={styles.frontContent}>
                    <Text style={styles.cardTitle}>Men's Health Index</Text>

                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreValue}>{card.overallHealthIndex}</Text>
                        <Text style={styles.scoreOutOf}>/100</Text>
                    </View>

                    <View style={[styles.riskBadge, { backgroundColor: riskColor }]}>
                        <Text style={styles.riskText}>{riskLevel} Risk</Text>
                    </View>

                    <View style={styles.statsPreview}>
                        <StatPreviewItem
                            label="Sperm Concentration"
                            value={`${card.semenQuality.spermConcentration}M/mL`}
                            status={classifyMetric(
                                card.semenQuality.spermConcentration,
                                HEALTH_REFERENCE_RANGES.semen.spermConcentration
                            )}
                        />
                        <StatPreviewItem
                            label="Progressive Motility"
                            value={`${card.semenQuality.progressiveMotility}%`}
                            status={classifyMetric(
                                card.semenQuality.progressiveMotility,
                                HEALTH_REFERENCE_RANGES.semen.progressiveMotility
                            )}
                        />
                        <StatPreviewItem
                            label="Lifestyle Score"
                            value={`${Math.round(card.lifestyleScore)}/100`}
                            status={card.lifestyleScore >= 70 ? 'within' : card.lifestyleScore >= 50 ? 'within' : 'below'}
                        />
                    </View>

                    <Text style={styles.dateText}>{formattedDate}</Text>
                    <Text style={styles.tapHint}>Tap to view details →</Text>
                </View>
            </Animated.View>

            {/* Back Side */}
            <Animated.View
                style={[
                    styles.card,
                    styles.cardBack,
                    {
                        opacity: backOpacity,
                        transform: [{ rotateY: backInterpolate }],
                    },
                ]}
            >
                <View style={styles.backContent}>
                    <Text style={styles.sectionTitle}>Semen Quality Metrics</Text>
                    <View style={styles.metricsTable}>
                        <MetricRow
                            label="Sperm Concentration"
                            value={`${card.semenQuality.spermConcentration} M/mL`}
                            status={classifyMetric(
                                card.semenQuality.spermConcentration,
                                HEALTH_REFERENCE_RANGES.semen.spermConcentration
                            )}
                            reference={getSemenComparisonLabel(
                                card.semenQuality.spermConcentration,
                                'spermConcentration'
                            )}
                        />
                        <MetricRow
                            label="Total Sperm Count"
                            value={`${card.semenQuality.totalSpermCount} M`}
                            status={classifyMetric(
                                card.semenQuality.totalSpermCount,
                                HEALTH_REFERENCE_RANGES.semen.totalSpermCount
                            )}
                            reference={getSemenComparisonLabel(
                                card.semenQuality.totalSpermCount,
                                'totalSpermCount'
                            )}
                        />
                        <MetricRow
                            label="Progressive Motility"
                            value={`${card.semenQuality.progressiveMotility}%`}
                            status={classifyMetric(
                                card.semenQuality.progressiveMotility,
                                HEALTH_REFERENCE_RANGES.semen.progressiveMotility
                            )}
                            reference={getSemenComparisonLabel(
                                card.semenQuality.progressiveMotility,
                                'progressiveMotility'
                            )}
                        />
                        <MetricRow
                            label="Total Motility"
                            value={`${card.semenQuality.totalMotility}%`}
                            status={classifyMetric(
                                card.semenQuality.totalMotility,
                                HEALTH_REFERENCE_RANGES.semen.totalMotility
                            )}
                            reference={getSemenComparisonLabel(
                                card.semenQuality.totalMotility,
                                'totalMotility'
                            )}
                        />
                        <MetricRow
                            label="Normal Morphology"
                            value={`${card.semenQuality.normalMorphology}%`}
                            status={classifyMetric(
                                card.semenQuality.normalMorphology,
                                HEALTH_REFERENCE_RANGES.semen.normalMorphology
                            )}
                            reference={getSemenComparisonLabel(
                                card.semenQuality.normalMorphology,
                                'normalMorphology'
                            )}
                        />
                        <MetricRow
                            label="Semen Volume"
                            value={`${card.semenQuality.semenVolume} mL`}
                            status={classifyMetric(
                                card.semenQuality.semenVolume,
                                HEALTH_REFERENCE_RANGES.semen.semenVolume
                            )}
                            reference={getSemenComparisonLabel(
                                card.semenQuality.semenVolume,
                                'semenVolume'
                            )}
                        />
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Lifestyle Factors</Text>
                    <View style={styles.metricsTable}>
                        <LifestyleRow label="Smoking" value={card.lifestyle.smokingStatus} />
                        <LifestyleRow label="Alcohol Risk" value={card.lifestyle.alcoholRiskLevel} />
                        <LifestyleRow label="Sleep" value={`${card.lifestyle.sleepHoursPerNight} hrs/night`} />
                        <LifestyleRow label="Exercise" value={`${card.lifestyle.weeklyExerciseMinutes} min/week`} />
                        <LifestyleRow label="Diet Quality" value={card.lifestyle.dietQuality} />
                    </View>

                    <Text style={styles.tapHint}>← Tap to flip back</Text>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
}

// Helper component for front-side stat preview
function StatPreviewItem({ label, value, status }: { label: string; value: string; status: any }) {
    const color = getStatusColor(status);
    const icon = status === 'within' || status === 'above' ? '✓' : '⚠';

    return (
        <View style={styles.previewItem}>
            <Text style={styles.previewLabel}>{label}</Text>
            <View style={styles.previewValue}>
                <Text style={[styles.previewValueText, { color }]}>
                    {value} {icon}
                </Text>
            </View>
        </View>
    );
}

// Helper component for back-side metric row
function MetricRow({
    label,
    value,
    status,
    reference,
}: {
    label: string;
    value: string;
    status: any;
    reference: string;
}) {
    const color = getStatusColor(status);
    const icon = status === 'within' || status === 'above' ? '✓' : '✗';

    return (
        <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>{label}</Text>
            <View style={styles.metricValueContainer}>
                <Text style={[styles.metricValue, { color }]}>
                    {value} {icon}
                </Text>
                <Text style={styles.metricReference}>{reference}</Text>
            </View>
        </View>
    );
}

// Helper component for lifestyle rows
function LifestyleRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>{label}</Text>
            <Text style={styles.metricValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        aspectRatio: 0.4, // Very compact - much shorter cards
        marginBottom: Spacing.xs,
    },
    card: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.sm,
        ...Shadows.md,
        backfaceVisibility: 'hidden',
    },
    cardFront: {
        justifyContent: 'space-between',
    },
    cardBack: {
        justifyContent: 'flex-start',
    },
    frontContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    backContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: Typography.size.xs,
        fontWeight: Typography.weight.semibold,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing.xs,
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginVertical: Spacing.xs,
    },
    scoreValue: {
        fontSize: Typography.size.base,
        fontWeight: Typography.weight.bold,
        color: Colors.black,
        letterSpacing: -0.5,
    },
    scoreOutOf: {
        fontSize: Typography.size.xxl,
        color: Colors.textTertiary,
        marginLeft: Spacing.xs,
    },
    riskBadge: {
        alignSelf: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: Colors.black,
        marginBottom: Spacing.xs,
    },
    riskText: {
        color: Colors.white,
        fontWeight: Typography.weight.semibold,
        fontSize: Typography.size.xs,
    },
    statsPreview: {
        flex: 1,
        justifyContent: 'space-around',
    },
    previewItem: {
        marginVertical: 2,
    },
    previewLabel: {
        fontSize: 8,
        color: Colors.textSecondary,
        marginBottom: 1,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    previewValue: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    previewValueText: {
        fontSize: Typography.size.xs,
        fontWeight: Typography.weight.semibold,
    },
    dateText: {
        fontSize: 8,
        color: Colors.textTertiary,
        textAlign: 'center',
        marginTop: 2,
    },
    tapHint: {
        fontSize: 8,
        color: Colors.textTertiary,
        textAlign: 'center',
        marginTop: 2,
        fontStyle: 'italic',
    },
    sectionTitle: {
        fontSize: Typography.size.base,
        fontWeight: Typography.weight.semibold,
        color: Colors.black,
        marginBottom: Spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    metricsTable: {
        marginBottom: Spacing.sm,
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    metricLabel: {
        fontSize: Typography.size.sm,
        color: Colors.textSecondary,
        flex: 1,
    },
    metricValueContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
    metricValue: {
        fontSize: Typography.size.sm,
        fontWeight: Typography.weight.semibold,
        color: Colors.black,
    },
    metricReference: {
        fontSize: Typography.size.xs,
        color: Colors.textTertiary,
        marginTop: 2,
    },
    selectionIndicator: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        ...Shadows.sm,
    },
    selectionIndicatorSelected: {
        borderColor: Colors.black,
        backgroundColor: Colors.black,
    },
    selectionIndicatorText: {
        fontSize: Typography.size.sm,
        fontWeight: Typography.weight.bold,
        color: Colors.textSecondary,
    },
    selectionIndicatorTextSelected: {
        color: Colors.white,
    },
    deleteButton: {
        position: 'absolute',
        top: Spacing.xs,
        right: Spacing.xs,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.error || '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
        ...Shadows.sm,
    },
    deleteButtonText: {
        fontSize: Typography.size.sm,
        fontWeight: Typography.weight.bold,
        color: Colors.white,
        lineHeight: 16,
    },
});
