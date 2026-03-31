// Daily Mood Check-In Component
// Allows users to log their daily mood (1-5 scale) with optional notes

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, getColors, Shadows, Spacing, Typography } from '../constants/design-system';
import { useTheme } from '../contexts/ThemeContext';
import { MoodEntry } from '../types/mood-types';
import DailyMoodChart from './DailyMoodChart';
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

const { width: screenWidth } = Dimensions.get('window');

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
  const [chartPeriod, setChartPeriod] = useState<'7days' | '30days' | 'all'>('30days');

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
      
      // Load recent entries (load all for chart, but display last 30 in list)
      const entries = await loadMoodEntries();
      setRecentEntries(entries); // Load all entries for chart
      
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

  // Generate chart data based on selected period
  const generateChartData = () => {
    let entriesToUse: MoodEntry[] = [];
    
    switch (chartPeriod) {
      case '7days':
        entriesToUse = recentEntries.filter(entry => {
          const entryDate = new Date(entry.date + 'T00:00:00');
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - 7);
          return entryDate >= cutoffDate;
        });
        break;
      case '30days':
        entriesToUse = recentEntries.filter(entry => {
          const entryDate = new Date(entry.date + 'T00:00:00');
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - 30);
          return entryDate >= cutoffDate;
        });
        break;
      case 'all':
        entriesToUse = recentEntries;
        break;
    }

    if (entriesToUse.length === 0) {
      return null;
    }

    // Sort by date (oldest first for chart)
    const sortedEntries = [...entriesToUse].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Create labels and data points
    const labels: string[] = [];
    const dataPoints: number[] = [];

    sortedEntries.forEach((entry) => {
      const date = new Date(entry.date + 'T00:00:00');
      // Format label based on period
      if (chartPeriod === '7days') {
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      } else if (chartPeriod === '30days') {
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      } else {
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }));
      }
      dataPoints.push(entry.moodScore);
    });

    // Limit labels to show every Nth entry to avoid crowding
    const maxLabels = chartPeriod === '7days' ? 7 : chartPeriod === '30days' ? 10 : 20;
    if (labels.length > maxLabels) {
      const step = Math.ceil(labels.length / maxLabels);
      const filteredLabels: string[] = [];
      const filteredData: number[] = [];
      
      for (let i = 0; i < labels.length; i += step) {
        filteredLabels.push(labels[i]);
        filteredData.push(dataPoints[i]);
      }
      
      // Always include the last point
      if (filteredLabels.length === 0 || filteredLabels[filteredLabels.length - 1] !== labels[labels.length - 1]) {
        filteredLabels.push(labels[labels.length - 1]);
        filteredData.push(dataPoints[dataPoints.length - 1]);
      }
      
      return {
        labels: filteredLabels,
        datasets: [{
          data: filteredData,
          color: (opacity = 1) => colorScheme === 'dark' 
            ? `rgba(255, 255, 255, ${opacity})` 
            : `rgba(0, 0, 0, ${opacity})`,
          strokeWidth: 2,
        }],
      };
    }

    return {
      labels,
      datasets: [{
        data: dataPoints,
        color: (opacity = 1) => colorScheme === 'dark' 
          ? `rgba(255, 255, 255, ${opacity})` 
          : `rgba(0, 0, 0, ${opacity})`,
        strokeWidth: 2,
      }],
    };
  };

  const chartData = generateChartData();

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

        {/* Daily Mood Chart */}
        {recentEntries.length > 0 && (
          <DailyMoodChart entries={recentEntries} />
        )}

        {/* Mood History Chart */}
        {chartData && recentEntries.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.white, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Mood History</Text>
            
            {/* Period Toggle */}
            <View style={[styles.periodToggle, { backgroundColor: colors.backgroundSecondary }]}>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  chartPeriod === '7days' && { backgroundColor: colors.black },
                ]}
                onPress={() => setChartPeriod('7days')}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    { color: chartPeriod === '7days' ? colors.white : colors.textSecondary },
                  ]}
                >
                  7 Days
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  chartPeriod === '30days' && { backgroundColor: colors.black },
                ]}
                onPress={() => setChartPeriod('30days')}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    { color: chartPeriod === '30days' ? colors.white : colors.textSecondary },
                  ]}
                >
                  30 Days
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  chartPeriod === 'all' && { backgroundColor: colors.black },
                ]}
                onPress={() => setChartPeriod('all')}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    { color: chartPeriod === 'all' ? colors.white : colors.textSecondary },
                  ]}
                >
                  All Time
                </Text>
              </TouchableOpacity>
            </View>

            {/* Chart */}
            <View style={styles.chartContainer}>
              <LineChart
                data={chartData}
                width={screenWidth - Spacing.base * 4}
                height={220}
                chartConfig={{
                  backgroundColor: colors.white,
                  backgroundGradientFrom: colors.white,
                  backgroundGradientTo: colors.white,
                  decimalPlaces: 1,
                  color: (opacity = 1) => colorScheme === 'dark' 
                    ? `rgba(255, 255, 255, ${opacity})` 
                    : `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => colorScheme === 'dark'
                    ? `rgba(255, 255, 255, ${opacity})`
                    : `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 0,
                  },
                  propsForDots: {
                    r: '5',
                    fill: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: '',
                    stroke: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: BorderRadius.md,
                }}
                withDots={true}
                withShadow={false}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                segments={4}
                yAxisLabel=""
                yAxisSuffix=""
                yAxisInterval={1}
                fromZero={false}
              />
            </View>

            {/* Chart Legend */}
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.black }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                  Mood Score (1-5)
                </Text>
              </View>
            </View>
          </View>
        )}

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
              {recentEntries.slice(0, 30).map((entry) => (
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
  periodToggle: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: Typography.size.xs,
  },
});
