// Men's Health Cards Page
// Displays all created cards and allows creating new ones

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MensHealthCard from './MensHealthCard';
import MensHealthCardForm from './MensHealthCardForm';
import { MensHealthCardData, SemenQualityMetrics, LifestyleMetrics } from '../types/mens-health-types';
import { saveMensHealthCard, loadMensHealthCards } from '../utils/storage';
import { calculateHealthCardData } from '../data/mens-health-references';
import { Colors, Shadows, BorderRadius, Typography, Spacing } from '../constants/design-system';

export default function Card() {
  const [cards, setCards] = useState<MensHealthCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Load cards on mount
  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    setLoading(true);
    try {
      const loadedCards = await loadMensHealthCards();
      // Sort by most recent first
      const sortedCards = loadedCards.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setCards(sortedCards);
    } catch (error) {
      Alert.alert('Error', 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (
    semen: SemenQualityMetrics,
    lifestyle: LifestyleMetrics,
    notes: string
  ) => {
    try {
      // Calculate scores
      const cardData = calculateHealthCardData(semen, lifestyle, notes);

      // Create new card with ID and timestamp
      const newCard: MensHealthCardData = {
        id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        ...cardData,
      };

      // Save to storage
      await saveMensHealthCard(newCard);

      // Reload cards
      await loadCards();

      // Close form
      setShowForm(false);

      Alert.alert('Success', 'Men\'s Health Card created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create card');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Men's Health Cards</Text>
          <TouchableOpacity style={styles.createButton} onPress={() => setShowForm(true)}>
            <Text style={styles.createButtonText}>+ Create New Card</Text>
          </TouchableOpacity>
        </View>

        {/* Empty State */}
        {cards.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No cards yet</Text>
            <Text style={styles.emptyStateText}>
              Create your first Men's Health Card to track your semen quality and lifestyle metrics.
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.emptyStateButtonText}>Create Your First Card</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cards Grid */}
        <View style={styles.cardsGrid}>
          {cards.map((card) => (
            <View key={card.id} style={styles.cardWrapper}>
              <MensHealthCard card={card} />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Create Card Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowForm(false)}
      >
        <MensHealthCardForm
          onSubmit={handleCreateCard}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
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
    color: Colors.black,
    marginBottom: Spacing.md,
    letterSpacing: -1,
  },
  createButton: {
    backgroundColor: Colors.black,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    ...Shadows.sm,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl * 2,
    paddingHorizontal: Spacing.xxxl,
  },
  emptyStateTitle: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    color: Colors.black,
    marginBottom: Spacing.md,
  },
  emptyStateText: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: Typography.size.base * Typography.lineHeight.relaxed,
  },
  emptyStateButton: {
    backgroundColor: Colors.black,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.md,
    ...Shadows.md,
  },
  emptyStateButtonText: {
    color: Colors.white,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.5,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.sm,
  },
  cardWrapper: {
    width: '100%',
    paddingHorizontal: Spacing.sm,
  },
});