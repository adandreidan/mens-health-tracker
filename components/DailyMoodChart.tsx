// Daily Mood Chart Component
// Color-coded bar chart showing mood per day (1=red → 5=green)

import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, getColors, Spacing, Typography } from '../constants/design-system';
import { useTheme } from '../contexts/ThemeContext';
import { MoodEntry } from '../types/mood-types';

const { width: screenWidth } = Dimensions.get('window');

const MOOD_COLORS: Record<number, string> = {
  1: '#FF4444',
  2: '#FF8C00',
  3: '#FFD700',
  4: '#66BB6A',
  5: '#00C853',
};

const MOOD_EMOJIS: Record<number, string> = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
};

const MOOD_LABELS: Record<number, string> = {
  1: 'Very Bad',
  2: 'Bad',
  3: 'Okay',
  4: 'Good',
  5: 'Very Good',
};

type Period = 7 | 14;

interface DailyMoodChartProps {
  entries: MoodEntry[];
}

function buildDaySlots(days: Period) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const slots: { dateStr: string; date: Date; isToday: boolean }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    slots.push({ dateStr, date: d, isToday: i === 0 });
  }
  return slots;
}

export default function DailyMoodChart({ entries }: DailyMoodChartProps) {
  const { colorScheme } = useTheme();
  const colors = getColors(colorScheme);
  const [period, setPeriod] = useState<Period>(7);

  const slots = buildDaySlots(period);
  const entryMap = new Map(entries.map((e) => [e.date, e]));

  const BAR_MAX_HEIGHT = 90;
  const cardPadding = Spacing.base * 2;
  const barAreaWidth = screenWidth - cardPadding - Spacing.base * 2;
  const BAR_WIDTH = Math.floor(barAreaWidth / period) - 4;

  // Find today's entry for the summary strip
  const todaySlot = slots[slots.length - 1];
  const todayEntry = entryMap.get(todaySlot.dateStr);

  return (
    <View style={[styles.container, { backgroundColor: colors.white, borderColor: colors.border }]}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Daily Mood</Text>
        <View style={[styles.toggle, { backgroundColor: colors.backgroundSecondary }]}>
          {([7, 14] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.toggleBtn, period === p && { backgroundColor: colors.black }]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.toggleText, { color: period === p ? colors.white : colors.textSecondary }]}>
                {p}d
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Today summary strip */}
      {todayEntry ? (
        <View style={[styles.todaySummary, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <Text style={styles.todayEmoji}>{MOOD_EMOJIS[todayEntry.moodScore]}</Text>
          <View style={styles.todayTextBlock}>
            <Text style={[styles.todayLabel, { color: colors.textPrimary }]}>
              Today — {MOOD_LABELS[todayEntry.moodScore]}
            </Text>
            {todayEntry.note ? (
              <Text style={[styles.todayNote, { color: colors.textSecondary }]} numberOfLines={1}>
                {todayEntry.note}
              </Text>
            ) : null}
          </View>
          <View style={[styles.todayScore, { backgroundColor: MOOD_COLORS[todayEntry.moodScore] }]}>
            <Text style={styles.todayScoreText}>{todayEntry.moodScore}/5</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.todaySummary, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <Text style={styles.todayEmoji}>📝</Text>
          <Text style={[styles.todayLabel, { color: colors.textSecondary }]}>No mood logged yet today</Text>
        </View>
      )}

      {/* Bar chart */}
      <View style={styles.chartArea}>
        {/* Y-axis hint labels */}
        <View style={styles.yAxis}>
          {[5, 3, 1].map((v) => (
            <Text key={v} style={[styles.yLabel, { color: colors.textTertiary }]}>
              {v}
            </Text>
          ))}
        </View>

        {/* Bars */}
        <View style={styles.barsRow}>
          {slots.map((slot) => {
            const entry = entryMap.get(slot.dateStr);
            const score = entry?.moodScore;
            const barHeight = score ? (score / 5) * BAR_MAX_HEIGHT : 0;
            const barColor = score ? MOOD_COLORS[score] : colors.backgroundSecondary;
            const dayLetter = slot.date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1);

            return (
              <View key={slot.dateStr} style={[styles.barColumn, { width: BAR_WIDTH + 4 }]}>
                {/* Emoji above bar */}
                <Text style={[styles.barEmoji, { opacity: score ? 1 : 0 }]}>
                  {score ? MOOD_EMOJIS[score] : '·'}
                </Text>

                {/* Bar track */}
                <View
                  style={[
                    styles.barTrack,
                    {
                      height: BAR_MAX_HEIGHT,
                      width: BAR_WIDTH,
                      backgroundColor: colors.backgroundTertiary,
                      borderRadius: BorderRadius.md,
                    },
                  ]}
                >
                  {/* Filled bar */}
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: barHeight,
                        width: BAR_WIDTH,
                        backgroundColor: barColor,
                        borderRadius: BorderRadius.md,
                      },
                    ]}
                  />
                  {/* Today highlight ring */}
                  {slot.isToday && (
                    <View
                      style={[
                        styles.todayRing,
                        {
                          height: BAR_MAX_HEIGHT,
                          width: BAR_WIDTH,
                          borderColor: colors.textPrimary,
                          borderRadius: BorderRadius.md,
                        },
                      ]}
                    />
                  )}
                </View>

                {/* Day label */}
                <Text
                  style={[
                    styles.dayLabel,
                    {
                      color: slot.isToday ? colors.textPrimary : colors.textTertiary,
                      fontWeight: slot.isToday ? Typography.weight.bold : Typography.weight.regular,
                    },
                  ]}
                >
                  {dayLetter}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Color legend */}
      <View style={styles.legend}>
        {[1, 2, 3, 4, 5].map((score) => (
          <View key={score} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: MOOD_COLORS[score] }]} />
            <Text style={[styles.legendText, { color: colors.textTertiary }]}>{score}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  toggle: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: 3,
    gap: 3,
  },
  toggleBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  toggleText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  todaySummary: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  todayEmoji: {
    fontSize: 28,
  },
  todayTextBlock: {
    flex: 1,
  },
  todayLabel: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  todayNote: {
    fontSize: Typography.size.sm,
    marginTop: 2,
  },
  todayScore: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  todayScoreText: {
    color: '#FFFFFF',
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  yAxis: {
    height: 90 + 20 + 16, // bar max height + emoji + label
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 16 + Spacing.xs, // align with bottom of bars
    paddingTop: 20, // align with top emoji row
    marginRight: Spacing.xs,
  },
  yLabel: {
    fontSize: Typography.size.xs,
  },
  barsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barColumn: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  barEmoji: {
    fontSize: 14,
    height: 20,
    textAlign: 'center',
  },
  barTrack: {
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    position: 'absolute',
    bottom: 0,
  },
  todayRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 2,
  },
  dayLabel: {
    fontSize: Typography.size.xs,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
