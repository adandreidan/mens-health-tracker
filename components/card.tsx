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
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, getColors, getShadows, Shadows, Spacing, Typography } from '../constants/design-system';
import { useTheme } from '../contexts/ThemeContext';
import { calculateHealthCardData } from '../data/mens-health-references';
import { LifestyleMetrics, MensHealthCardData, SemenQualityMetrics } from '../types/mens-health-types';
import { deleteMensHealthCard, getSelectedCard, loadMensHealthCards, saveMensHealthCard, setSelectedCard } from '../utils/storage';
import FlexingManLogo from './FlexingManLogo';
import MensHealthCard from './MensHealthCard';
import MensHealthCardForm from './MensHealthCardForm';
import ThemeToggle from './ThemeToggle';

export default function Card() {
  const { colorScheme } = useTheme();
  const colors = getColors(colorScheme);
  const shadows = getShadows(colorScheme);
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
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this health card? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
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
          },
        },
      ]
    );
  };

  const handleCreateCard = async (
    semen: SemenQualityMetrics,
    lifestyle: LifestyleMetrics,
    notes: string,
    name?: string,
    height?: number,
    weight?: number
  ) => {
    try {
      console.log('Creating card with data:', { semen, lifestyle, notes, name, height, weight });

      // Calculate scores
      const cardData = calculateHealthCardData(semen, lifestyle, notes, name);
      console.log('Calculated card data:', cardData);

      // Create new card with ID and timestamp
      const newCard: MensHealthCardData = {
        id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        height,
        weight,
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
      <View style={[styles.centerContainer, { backgroundColor: colors.backgroundSecondary }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <FlexingManLogo size={60} />
            <Text style={[styles.title, { color: colors.textPrimary }]}>Men's Health Cards</Text>
            <ThemeToggle />
          </View>
          <View style={styles.headerButtons}>
            {!selectionMode && !deleteMode && cards.length > 0 && (
              <>
                <TouchableOpacity
                  style={[styles.selectButton, { backgroundColor: colors.white, borderColor: colors.black }, shadows.sm]}
                  onPress={() => setSelectionMode(true)}
                >
                  <Text style={[styles.selectButtonText, { color: colors.textPrimary }]}>Select for Rankings</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteModeButton, { backgroundColor: colors.error }, shadows.sm]}
                  onPress={() => setDeleteMode(true)}
                >
                  <Text style={[styles.deleteModeButtonText, { color: colors.white }]}>Delete Cards</Text>
                </TouchableOpacity>
              </>
            )}
            {(selectionMode || deleteMode) && (
              <TouchableOpacity
                style={[styles.cancelSelectButton, { backgroundColor: colors.grey100 }]}
                onPress={() => {
                  setSelectionMode(false);
                  setDeleteMode(false);
                }}
              >
                <Text style={[styles.cancelSelectButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.createButton, { backgroundColor: colors.black }, shadows.md]} onPress={() => setShowForm(true)}>
              <Text style={[styles.createButtonText, { color: colors.white }]}>+ Create New Card</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Empty State */}
        {cards.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateTitle, { color: colors.textPrimary }]}>No cards yet</Text>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              Create your first Men's Health Card to track your semen quality and lifestyle metrics.
            </Text>
            <TouchableOpacity
              style={[styles.emptyStateButton, { backgroundColor: colors.black }, shadows.md]}
              onPress={() => setShowForm(true)}
            >
              <Text style={[styles.emptyStateButtonText, { color: colors.white }]}>Create Your First Card</Text>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.base,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  title: {
    fontSize: Typography.size.xxxl,
    fontWeight: Typography.weight.bold,
    letterSpacing: -1,
    flex: 1,
  },
  createButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    ...Shadows.sm,
  },
  createButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.5,
  },
  selectButton: {
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    ...Shadows.sm,
  },
  selectButtonText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.5,
  },
  cancelSelectButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    ...Shadows.sm,
  },
  cancelSelectButtonText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.5,
  },
  deleteModeButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    ...Shadows.sm,
  },
  deleteModeButtonText: {
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
    marginBottom: Spacing.md,
  },
  emptyStateText: {
    fontSize: Typography.size.base,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: Typography.size.base * Typography.lineHeight.relaxed,
  },
  emptyStateButton: {
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.md,
    ...Shadows.md,
  },
  emptyStateButtonText: {
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
    width: '48%', // 2 cards per row for better readability
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.base,
  },
});