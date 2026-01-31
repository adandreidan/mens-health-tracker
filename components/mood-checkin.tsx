// Daily Mood Check-In Component
// Allows users to log their daily mood (1-5 scale) with optional notes

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, getColors, Shadows, Spacing, Typography } from '../constants/design-system';
import { useTheme } from '../contexts/ThemeContext';
import { MoodEntry } from '../types/mood-types';
import {
  calculateAverageMood,
  calculateTrend,
  getLast30DaysMoods,
  getLast7DaysMoods,
  getTodayMoodEntry,
  getTrendMessage,
  hasLoggedToday,
  loadMoodEntries,
  saveMoodEntry,
} from '../utils/mood-storage';

export default function MoodCheckIn() {
  const { colorScheme } = useTheme();
  const colors = getColors(colorScheme);
  
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasLogged, setHasLogged] = useState(false);
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null);
  const [recentEntries, setRecentEntries] = useState<MoodEntry[]>([]);
  const [sevenDayAvg, setSevenDayAvg] = useState(0);
  const [thirtyDayAvg, setThirtyDayAvg] = useState(0);
  const [trendMessage, setTrendMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Check if already logged today
      const logged = await hasLoggedToday();
      setHasLogged(logged);
      
      if (logged) {
        const today = await getTodayMoodEntry();
        setTodayEntry(today);
        if (today) {
          setMoodScore(today.moodScore);
          setNote(today.note || '');
        }
      }
      
      // Load recent entries
      const entries = await loadMoodEntries();
      setRecentEntries(entries.slice(0, 30)); // Show last 30 entries
      
      // Calculate averages and trends
      const last7Days = await getLast7DaysMoods();
      const last30Days = await getLast30DaysMoods();
      
      const avg7 = calculateAverageMood(last7Days);
      const avg30 = calculateAverageMood(last30Days);
      
      setSevenDayAvg(avg7);
      setThirtyDayAvg(avg30);
      
      // Calculate trend (comparing last 7 vs previous 7)
      const allEntries = await loadMoodEntries();
      const trend = calculateTrend(allEntries);
      
      // Get previous 7 days average for trend message
      const allSorted = [...allEntries].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const previous7 = allSorted.slice(-14, -7);
      const previous7Avg = calculateAverageMood(previous7);
      
      const message = getTrendMessage(trend, avg7, previous7Avg);
      setTrendMessage(message);
      
    } catch (error) {
      console.error('Error loading mood data:', error);
      Alert.alert('Error', 'Failed to load mood data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoodSelect = (score: number) => {
    if (hasLogged) {
      Alert.alert(
        'Already Logged',
        'You have already logged your mood for today. You can update it by selecting a new mood score.',
        [{ text: 'OK' }]
      );
    }
    setMoodScore(score);
  };

  const handleSave = async () => {
    if (moodScore === null) {
      Alert.alert('Required', 'Please select a mood score');
      return;
    }

    if (note.length > 200) {
      Alert.alert('Error', 'Note must be 200 characters or less');
      return;
    }

    try {
      const today = new Date();
      const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const entry: MoodEntry = {
        id: `mood_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: dateString,
        moodScore,
        note: note.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      await saveMoodEntry(entry);
      setHasLogged(true);
      setTodayEntry(entry);
      
      Alert.alert('Success', hasLogged ? 'Mood updated successfully!' : 'Mood logged successfully!');
      
      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error saving mood:', error);
      Alert.alert('Error', 'Failed to save mood entry');
    }
  };

  const getMoodLabel = (score: number): string => {
    const labels: { [key: number]: string } = {
      1: 'Very Bad',
      2: 'Bad',
      3: 'Okay',
      4: 'Good',
      5: 'Very Good',
    };
    return labels[score] || '';
  };

  const getMoodEmoji = (score: number): string => {
    const emojis: { [key: number]: string } = {
      1: '😢',
      2: '😕',
      3: '😐',
      4: '🙂',
      5: '😄',
    };
    return emojis[score] || '';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const entryDate = new Date(dateString + 'T00:00:00');
    entryDate.setHours(0, 0, 0, 0);

    if (entryDate.getTime() === today.getTime()) {
      return 'Today';
    }
    if (entryDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.backgroundSecondary }]}>
        <ActivityIndicator size="large" color={colors.black} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Daily Mood Check-In</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            How are you feeling today?
          </Text>
        </View>

        {/* Today's Check-In */}
        <View style={[styles.card, { backgroundColor: colors.white, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {hasLogged ? 'Today\'s Mood' : 'Log Your Mood'}
          </Text>
          
          {hasLogged && todayEntry ? (
            <View style={styles.loggedView}>
              <View style={styles.loggedMoodDisplay}>
                <Text style={styles.loggedEmoji}>{getMoodEmoji(todayEntry.moodScore)}</Text>
                <View>
                  <Text style={[styles.loggedScore, { color: colors.textPrimary }]}>
                    {getMoodLabel(todayEntry.moodScore)}
                  </Text>
                  <Text style={[styles.loggedScoreNumber, { color: colors.textSecondary }]}>
                    {todayEntry.moodScore}/5
                  </Text>
                </View>
              </View>
              {todayEntry.note && (
                <View style={[styles.noteDisplay, { backgroundColor: colors.backgroundSecondary }]}>
                  <Text style={[styles.noteText, { color: colors.textPrimary }]}>
                    {todayEntry.note}
                  </Text>
                </View>
              )}
              <Text style={[styles.updateHint, { color: colors.textSecondary }]}>
                Select a different mood to update today's entry
              </Text>
            </View>
          ) : (
            <>
              {/* Mood Score Selection */}
              <View style={styles.moodButtonsContainer}>
                {[1, 2, 3, 4, 5].map((score) => (
                  <TouchableOpacity
                    key={score}
                    style={[
                      styles.moodButton,
                      {
                        backgroundColor: moodScore === score ? colors.black : colors.backgroundSecondary,
                        borderColor: moodScore === score ? colors.black : colors.border,
                      },
                    ]}
                    onPress={() => handleMoodSelect(score)}
                  >
                    <Text style={styles.moodEmoji}>{getMoodEmoji(score)}</Text>
                    <Text
                      style={[
                        styles.moodButtonText,
                        { color: moodScore === score ? colors.white : colors.textPrimary },
                      ]}
                    >
                      {score}
                    </Text>
                    <Text
                      style={[
                        styles.moodButtonLabel,
                        { color: moodScore === score ? colors.white : colors.textSecondary },
                      ]}
                    >
                      {getMoodLabel(score)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Optional Note */}
              <View style={styles.noteContainer}>
                <Text style={[styles.noteLabel, { color: colors.textSecondary }]}>
                  Optional Note ({note.length}/200)
                </Text>
                <TextInput
                  style={[
                    styles.noteInput,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      color: colors.textPrimary,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="How are you feeling?"
                  placeholderTextColor={colors.textTertiary}
                  value={note}
                  onChangeText={(text) => {
                    if (text.length <= 200) {
                      setNote(text);
                    }
                  }}
                  multiline
                  maxLength={200}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  {
                    backgroundColor: moodScore !== null ? colors.black : colors.grey300,
                  },
                ]}
                onPress={handleSave}
                disabled={moodScore === null}
              >
                <Text style={[styles.saveButtonText, { color: colors.white }]}>
                  {hasLogged ? 'Update Mood' : 'Log Mood'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Insights Summary */}
        {(sevenDayAvg > 0 || thirtyDayAvg > 0) && (
          <View style={[styles.card, { backgroundColor: colors.white, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Mood Insights</Text>
            
            <View style={styles.insightsGrid}>
              {sevenDayAvg > 0 && (
                <View style={styles.insightItem}>
                  <Text style={[styles.insightValue, { color: colors.textPrimary }]}>
                    {sevenDayAvg.toFixed(1)}
                  </Text>
                  <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>
                    7-Day Average
                  </Text>
                </View>
              )}
              
              {thirtyDayAvg > 0 && (
                <View style={styles.insightItem}>
                  <Text style={[styles.insightValue, { color: colors.textPrimary }]}>
                    {thirtyDayAvg.toFixed(1)}
                  </Text>
                  <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>
                    30-Day Average
                  </Text>
                </View>
              )}
            </View>
            
            {trendMessage && (
              <View style={[styles.trendMessage, { backgroundColor: colors.backgroundSecondary }]}>
                <Text style={[styles.trendText, { color: colors.textPrimary }]}>
                  {trendMessage}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Recent Moods List */}
        {recentEntries.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.white, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Recent Moods</Text>
            
            <View style={styles.moodsList}>
              {recentEntries.map((entry) => (
                <View
                  key={entry.id}
                  style={[
                    styles.moodItem,
                    {
                      backgroundColor: entry.date === todayEntry?.date ? colors.backgroundSecondary : 'transparent',
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.moodItemLeft}>
                    <Text style={styles.moodItemEmoji}>{getMoodEmoji(entry.moodScore)}</Text>
                    <View>
                      <Text style={[styles.moodItemDate, { color: colors.textPrimary }]}>
                        {formatDate(entry.date)}
                      </Text>
                      {entry.note && (
                        <Text
                          style={[styles.moodItemNote, { color: colors.textSecondary }]}
                          numberOfLines={1}
                        >
                          {entry.note}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text style={[styles.moodItemScore, { color: colors.textSecondary }]}>
                    {entry.moodScore}/5
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {recentEntries.length === 0 && !hasLogged && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No mood entries yet. Start tracking your daily mood!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.base,
    fontSize: Typography.size.base,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.base,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.size.xxxl,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.xs,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: Typography.size.base,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
    ...Shadows.sm,
  },
  cardTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.md,
  },
  moodButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  moodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    minHeight: 100,
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  moodButtonText: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.xs,
  },
  moodButtonLabel: {
    fontSize: Typography.size.xs,
    textAlign: 'center',
  },
  noteContainer: {
    marginBottom: Spacing.lg,
  },
  noteLabel: {
    fontSize: Typography.size.sm,
    marginBottom: Spacing.xs,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: Typography.size.base,
  },
  saveButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  saveButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  loggedView: {
    alignItems: 'center',
  },
  loggedMoodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  loggedEmoji: {
    fontSize: 48,
  },
  loggedScore: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  loggedScoreNumber: {
    fontSize: Typography.size.base,
  },
  noteDisplay: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    width: '100%',
  },
  noteText: {
    fontSize: Typography.size.base,
  },
  updateHint: {
    fontSize: Typography.size.xs,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  insightsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  insightItem: {
    alignItems: 'center',
  },
  insightValue: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.xs,
  },
  insightLabel: {
    fontSize: Typography.size.sm,
  },
  trendMessage: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  trendText: {
    fontSize: Typography.size.base,
    textAlign: 'center',
  },
  moodsList: {
    gap: 0,
  },
  moodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  moodItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  moodItemEmoji: {
    fontSize: 24,
  },
  moodItemDate: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
  },
  moodItemNote: {
    fontSize: Typography.size.sm,
    marginTop: Spacing.xs,
  },
  moodItemScore: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  emptyState: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: Typography.size.base,
    textAlign: 'center',
  },
});
