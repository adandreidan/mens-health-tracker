// Men's Health Card Form Component
// Form for creating new health cards with validation

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import {
    SemenQualityMetrics,
    LifestyleMetrics,
    SmokingStatus,
    AlcoholRiskLevel,
    DietQuality,
} from '../types/mens-health-types';
import { Colors, Shadows, BorderRadius, Typography, Spacing } from '../constants/design-system';

interface MensHealthCardFormProps {
    onSubmit: (semen: SemenQualityMetrics, lifestyle: LifestyleMetrics, notes: string) => void;
    onCancel: () => void;
}

export default function MensHealthCardForm({ onSubmit, onCancel }: MensHealthCardFormProps) {
    // Semen quality state
    const [spermConcentration, setSpermConcentration] = useState('');
    const [totalSpermCount, setTotalSpermCount] = useState('');
    const [progressiveMotility, setProgressiveMotility] = useState('');
    const [totalMotility, setTotalMotility] = useState('');
    const [normalMorphology, setNormalMorphology] = useState('');
    const [semenVolume, setSemenVolume] = useState('');

    // Lifestyle state
    const [smokingStatus, setSmokingStatus] = useState<SmokingStatus>('non-smoker');
    const [alcoholRiskLevel, setAlcoholRiskLevel] = useState<AlcoholRiskLevel>('low');
    const [sleepHours, setSleepHours] = useState('');
    const [exerciseMinutes, setExerciseMinutes] = useState('');
    const [dietQuality, setDietQuality] = useState<DietQuality>('good');

    // Notes
    const [notes, setNotes] = useState('');

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Required numeric fields
        if (!spermConcentration || parseFloat(spermConcentration) < 0) {
            newErrors.spermConcentration = 'Required (non-negative)';
        }
        if (!totalSpermCount || parseFloat(totalSpermCount) < 0) {
            newErrors.totalSpermCount = 'Required (non-negative)';
        }
        if (!progressiveMotility || parseFloat(progressiveMotility) < 0 || parseFloat(progressiveMotility) > 100) {
            newErrors.progressiveMotility = 'Required (0-100)';
        }
        if (!totalMotility || parseFloat(totalMotility) < 0 || parseFloat(totalMotility) > 100) {
            newErrors.totalMotility = 'Required (0-100)';
        }
        if (!normalMorphology || parseFloat(normalMorphology) < 0 || parseFloat(normalMorphology) > 100) {
            newErrors.normalMorphology = 'Required (0-100)';
        }
        if (!semenVolume || parseFloat(semenVolume) < 0 || parseFloat(semenVolume) > 10) {
            newErrors.semenVolume = 'Required (0-10 mL)';
        }
        if (!sleepHours || parseFloat(sleepHours) < 0 || parseFloat(sleepHours) > 24) {
            newErrors.sleepHours = 'Required (0-24)';
        }
        if (!exerciseMinutes || parseFloat(exerciseMinutes) < 0) {
            newErrors.exerciseMinutes = 'Required (non-negative)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            Alert.alert('Validation Error', 'Please fix the errors and try again.');
            return;
        }

        const semenData: SemenQualityMetrics = {
            spermConcentration: parseFloat(spermConcentration),
            totalSpermCount: parseFloat(totalSpermCount),
            progressiveMotility: parseFloat(progressiveMotility),
            totalMotility: parseFloat(totalMotility),
            normalMorphology: parseFloat(normalMorphology),
            semenVolume: parseFloat(semenVolume),
        };

        const lifestyleData: LifestyleMetrics = {
            smokingStatus,
            alcoholRiskLevel,
            sleepHoursPerNight: parseFloat(sleepHours),
            weeklyExerciseMinutes: parseFloat(exerciseMinutes),
            dietQuality,
        };

        onSubmit(semenData, lifestyleData, notes);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <Text style={styles.title}>Create Men's Health Card</Text>
                <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
                    <Text style={styles.cancelText}>✕</Text>
                </TouchableOpacity>
            </View>

            {/* Semen Quality Section */}
            <Text style={styles.sectionTitle}>Semen Quality Metrics</Text>

            <InputField
                label="Sperm Concentration (million/mL)"
                value={spermConcentration}
                onChangeText={setSpermConcentration}
                error={errors.spermConcentration}
                keyboardType="decimal-pad"
                placeholder="e.g., 52"
            />

            <InputField
                label="Total Sperm Count (million)"
                value={totalSpermCount}
                onChangeText={setTotalSpermCount}
                error={errors.totalSpermCount}
                keyboardType="decimal-pad"
                placeholder="e.g., 180"
            />

            <InputField
                label="Progressive Motility (%)"
                value={progressiveMotility}
                onChangeText={setProgressiveMotility}
                error={errors.progressiveMotility}
                keyboardType="decimal-pad"
                placeholder="e.g., 45"
            />

            <InputField
                label="Total Motility (%)"
                value={totalMotility}
                onChangeText={setTotalMotility}
                error={errors.totalMotility}
                keyboardType="decimal-pad"
                placeholder="e.g., 60"
            />

            <InputField
                label="Normal Morphology (%)"
                value={normalMorphology}
                onChangeText={setNormalMorphology}
                error={errors.normalMorphology}
                keyboardType="decimal-pad"
                placeholder="e.g., 6"
            />

            <InputField
                label="Semen Volume (mL)"
                value={semenVolume}
                onChangeText={setSemenVolume}
                error={errors.semenVolume}
                keyboardType="decimal-pad"
                placeholder="e.g., 3.5"
            />

            {/* Lifestyle Section */}
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Lifestyle Factors</Text>

            <PickerField
                label="Smoking Status"
                options={['non-smoker', 'occasional', 'daily']}
                selectedValue={smokingStatus}
                onValueChange={(value) => setSmokingStatus(value as SmokingStatus)}
            />

            <PickerField
                label="Alcohol Risk Level"
                options={['low', 'moderate', 'high']}
                selectedValue={alcoholRiskLevel}
                onValueChange={(value) => setAlcoholRiskLevel(value as AlcoholRiskLevel)}
            />

            <InputField
                label="Sleep Hours per Night"
                value={sleepHours}
                onChangeText={setSleepHours}
                error={errors.sleepHours}
                keyboardType="decimal-pad"
                placeholder="e.g., 8"
            />

            <InputField
                label="Weekly Exercise Minutes"
                value={exerciseMinutes}
                onChangeText={setExerciseMinutes}
                error={errors.exerciseMinutes}
                keyboardType="decimal-pad"
                placeholder="e.g., 180"
            />

            <PickerField
                label="Diet Quality"
                options={['poor', 'fair', 'good']}
                selectedValue={dietQuality}
                onValueChange={(value) => setDietQuality(value as DietQuality)}
            />

            {/* Notes Section */}
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Notes (Optional)</Text>
            <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any notes or comments..."
                multiline
                numberOfLines={3}
            />

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Create Card</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

// Helper component for text input fields
function InputField({
    label,
    value,
    onChangeText,
    error,
    keyboardType = 'default',
    placeholder,
}: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    error?: string;
    keyboardType?: any;
    placeholder?: string;
}) {
    return (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                placeholder={placeholder}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

// Helper component for picker fields
function PickerField({
    label,
    options,
    selectedValue,
    onValueChange,
}: {
    label: string;
    options: string[];
    selectedValue: string;
    onValueChange: (value: string) => void;
}) {
    return (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.pickerContainer}>
                {options.map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.pickerOption,
                            selectedValue === option && styles.pickerOptionSelected,
                        ]}
                        onPress={() => onValueChange(option)}
                    >
                        <Text
                            style={[
                                styles.pickerOptionText,
                                selectedValue === option && styles.pickerOptionTextSelected,
                            ]}
                        >
                            {option}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    contentContainer: {
        padding: Spacing.xl,
        paddingBottom: Spacing.xxxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xxl,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        paddingBottom: Spacing.base,
    },
    title: {
        fontSize: Typography.size.xxl,
        fontWeight: Typography.weight.bold,
        color: Colors.black,
        letterSpacing: -0.5,
    },
    cancelButton: {
        padding: Spacing.sm,
    },
    cancelText: {
        fontSize: Typography.size.xxl,
        color: Colors.textSecondary,
    },
    sectionTitle: {
        fontSize: Typography.size.base,
        fontWeight: Typography.weight.semibold,
        color: Colors.black,
        marginBottom: Spacing.base,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputContainer: {
        marginBottom: Spacing.base,
    },
    inputLabel: {
        fontSize: Typography.size.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        fontSize: Typography.size.base,
        backgroundColor: Colors.white,
        color: Colors.black,
    },
    inputError: {
        borderColor: Colors.error,
    },
    errorText: {
        fontSize: Typography.size.xs,
        color: Colors.error,
        marginTop: Spacing.xs,
    },
    pickerContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    pickerOption: {
        flex: 1,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.sm,
        borderWidth: 1.5,
        borderColor: Colors.border,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.white,
        alignItems: 'center',
    },
    pickerOptionSelected: {
        backgroundColor: Colors.black,
        borderColor: Colors.black,
    },
    pickerOptionText: {
        fontSize: Typography.size.sm,
        color: Colors.textSecondary,
        fontWeight: Typography.weight.medium,
    },
    pickerOptionTextSelected: {
        color: Colors.white,
        fontWeight: Typography.weight.semibold,
    },
    notesInput: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        fontSize: Typography.size.base,
        backgroundColor: Colors.white,
        height: 80,
        textAlignVertical: 'top',
        color: Colors.black,
    },
    submitButton: {
        backgroundColor: Colors.black,
        paddingVertical: Spacing.base,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        marginTop: Spacing.xxl,
        ...Shadows.md,
    },
    submitButtonText: {
        color: Colors.white,
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.semibold,
        letterSpacing: 0.5,
    },
});
