// Mood Check-In Storage Utilities
// Handles persistence of daily mood entries using AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry } from '../types/mood-types';

const MOOD_STORAGE_KEY = '@mood_entries';

/**
 * Save a new mood entry
 * Prevents duplicate entries for the same date
 */
export async function saveMoodEntry(entry: MoodEntry): Promise<void> {
  try {
    const existingEntries = await loadMoodEntries();
    
    // Check if entry for this date already exists
    const existingIndex = existingEntries.findIndex(e => e.date === entry.date);
    
    if (existingIndex >= 0) {
      // Update existing entry
      existingEntries[existingIndex] = entry;
    } else {
      // Add new entry
      existingEntries.push(entry);
    }
    
    // Sort by date (newest first)
    existingEntries.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    await AsyncStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(existingEntries));
  } catch (error) {
    console.error('Error saving mood entry:', error);
    throw new Error('Failed to save mood entry');
  }
}

/**
 * Load all mood entries sorted by date (newest first)
 */
export async function loadMoodEntries(): Promise<MoodEntry[]> {
  try {
    const entriesJson = await AsyncStorage.getItem(MOOD_STORAGE_KEY);
    if (!entriesJson) return [];
    
    const entries = JSON.parse(entriesJson) as MoodEntry[];
    // Ensure sorted by date (newest first)
    return entries.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error('Error loading mood entries:', error);
    return [];
  }
}

/**
 * Get mood entries for the last N days
 */
export async function getMoodEntriesForLastDays(days: number): Promise<MoodEntry[]> {
  try {
    const allEntries = await loadMoodEntries();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateString = formatDate(cutoffDate);
    
    return allEntries.filter(entry => entry.date >= cutoffDateString);
  } catch (error) {
    console.error('Error loading mood entries for last days:', error);
    return [];
  }
}

/**
 * Get last 7 days of mood entries
 */
export async function getLast7DaysMoods(): Promise<MoodEntry[]> {
  return getMoodEntriesForLastDays(7);
}

/**
 * Get last 30 days of mood entries
 */
export async function getLast30DaysMoods(): Promise<MoodEntry[]> {
  return getMoodEntriesForLastDays(30);
}

/**
 * Check if user has already logged mood for today
 */
export async function hasLoggedToday(): Promise<boolean> {
  try {
    const today = formatDate(new Date());
    const entries = await loadMoodEntries();
    return entries.some(entry => entry.date === today);
  } catch (error) {
    console.error('Error checking today\'s entry:', error);
    return false;
  }
}

/**
 * Get today's mood entry if it exists
 */
export async function getTodayMoodEntry(): Promise<MoodEntry | null> {
  try {
    const today = formatDate(new Date());
    const entries = await loadMoodEntries();
    return entries.find(entry => entry.date === today) || null;
  } catch (error) {
    console.error('Error getting today\'s mood entry:', error);
    return null;
  }
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate average mood from entries
 */
export function calculateAverageMood(entries: MoodEntry[]): number {
  if (entries.length === 0) return 0;
  const sum = entries.reduce((acc, entry) => acc + entry.moodScore, 0);
  return sum / entries.length;
}

/**
 * Calculate trend direction comparing last 7 days vs previous 7 days
 */
export function calculateTrend(entries: MoodEntry[]): 'up' | 'down' | 'flat' {
  if (entries.length < 14) return 'flat';
  
  // Sort by date (oldest first for this calculation)
  const sorted = [...entries].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const last7 = sorted.slice(-7);
  const previous7 = sorted.slice(-14, -7);
  
  const last7Avg = calculateAverageMood(last7);
  const previous7Avg = calculateAverageMood(previous7);
  
  const difference = last7Avg - previous7Avg;
  const threshold = 0.1; // Small threshold to avoid noise
  
  if (difference > threshold) return 'up';
  if (difference < -threshold) return 'down';
  return 'flat';
}

/**
 * Generate trend message
 */
export function getTrendMessage(trend: 'up' | 'down' | 'flat', sevenDayAvg: number, previousAvg: number): string {
  const diff = Math.abs(sevenDayAvg - previousAvg);
  
  if (trend === 'up') {
    if (diff > 0.5) return 'Your mood this week is significantly higher than last week.';
    if (diff > 0.2) return 'Your mood this week is higher than last week.';
    return 'Your mood this week is slightly higher than last week.';
  }
  
  if (trend === 'down') {
    if (diff > 0.5) return 'Your mood this week is significantly lower than last week.';
    if (diff > 0.2) return 'Your mood this week is lower than last week.';
    return 'Your mood this week is slightly lower than last week.';
  }
  
  return 'Your mood this week is about the same as last week.';
}
