// Men's Health Cards Page
// Displays all created cards and allows creating new ones

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../constants/design-system';
import { calculateHealthCardData } from '../data/mens-health-references';
import { LifestyleMetrics, MensHealthCardData, SemenQualityMetrics } from '../types/mens-health-types';
import { deleteMensHealthCard, getSelectedCard, loadMensHealthCards, saveMensHealthCard, setSelectedCard } from '../utils/storage';
import MensHealthCard from './MensHealthCard';
import MensHealthCardForm from './MensHealthCardForm';

export default function Card() {
  const [cards, setCards] = useState<MensHealthCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);

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

      // Load selected card
      const selectedCard = await getSelectedCard();
      setSelectedCardId(selectedCard?.id || null);
    } catch (error) {
      Alert.alert('Error', 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const handleCardSelect = async (cardId: string) => {
    try {
      await setSelectedCard(cardId);
      setSelectedCardId(cardId);
      setSelectionMode(false);
      Alert.alert('Success', 'Card selected for leaderboard rankings!');
    } catch (error) {
      Alert.alert('Error', 'Failed to select card');
    }
  };

  const handleCardDelete = async (cardId: string) => {
    try {
      await deleteMensHealthCard(cardId);

      // If the deleted card was selected, clear the selection
      if (selectedCardId === cardId) {
        setSelectedCardId(null);
      }

      await loadCards();
      setDeleteMode(false);
      Alert.alert('Success', 'Card deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete card');
    }
  };

  const handleCreateCard = async (
    semen: SemenQualityMetrics,
    lifestyle: LifestyleMetrics,
    notes: string
  ) => {
    try {
      console.log('Creating card with data:', { semen, lifestyle, notes });

      // Calculate scores
      const cardData = calculateHealthCardData(semen, lifestyle, notes);
      console.log('Calculated card data:', cardData);

      // Create new card with ID and timestamp
      const newCard: MensHealthCardData = {
        id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        ...cardData,
      };

      console.log('New card object:', newCard);

      // Save to storage
      await saveMensHealthCard(newCard);
      console.log('Card saved to storage');

      // Reload cards
      await loadCards();

      // Close form
      setShowForm(false);

      Alert.alert('Success', 'Men\'s Health Card created successfully!');
    } catch (error) {
      console.error('Error creating card:', error);
      Alert.alert('Error', `Failed to create card: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          <View style={styles.headerButtons}>
            {!selectionMode && !deleteMode && cards.length > 0 && (
              <>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setSelectionMode(true)}
                >
                  <Text style={styles.selectButtonText}>Select for Rankings</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteModeButton}
                  onPress={() => setDeleteMode(true)}
                >
                  <Text style={styles.deleteModeButtonText}>Delete Cards</Text>
                </TouchableOpacity>
              </>
            )}
            {(selectionMode || deleteMode) && (
              <TouchableOpacity
                style={styles.cancelSelectButton}
                onPress={() => {
                  setSelectionMode(false);
                  setDeleteMode(false);
                }}
              >
                <Text style={styles.cancelSelectButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.createButton} onPress={() => setShowForm(true)}>
              <Text style={styles.createButtonText}>+ Create New Card</Text>
            </TouchableOpacity>
          </View>
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
              <MensHealthCard
                card={card}
                isSelected={selectedCardId === card.id}
                onSelect={handleCardSelect}
                showSelectionIndicator={selectionMode}
                onDelete={handleCardDelete}
                showDeleteButton={deleteMode}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Create Card Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
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
  headerButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
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
  selectButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.black,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    ...Shadows.sm,
  },
  selectButtonText: {
    color: Colors.black,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.5,
  },
  cancelSelectButton: {
    backgroundColor: Colors.grey100,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    ...Shadows.sm,
  },
  cancelSelectButtonText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.5,
  },
  deleteModeButton: {
    backgroundColor: Colors.error || '#FF3B30',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    ...Shadows.sm,
  },
  deleteModeButtonText: {
    color: Colors.white,
    fontSize: Typography.size.sm,
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
    width: '15%', // Much smaller cards - about 6-7 per row
    paddingHorizontal: Spacing.xs,
  },
});