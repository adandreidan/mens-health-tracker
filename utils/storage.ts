// AsyncStorage utility functions for Men's Health Card persistence

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MensHealthCardData } from '../types/mens-health-types';

const STORAGE_KEY = '@mens_health_cards';
const SELECTED_CARD_KEY = '@selected_health_card';

// Save a new Men's Health Card
export async function saveMensHealthCard(card: MensHealthCardData): Promise<void> {
    try {
        const existingCards = await loadMensHealthCards();
        const updatedCards = [...existingCards, card];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));
    } catch (error) {
        console.error('Error saving Men\'s Health Card:', error);
        throw new Error('Failed to save card');
    }
}

// Load all Men's Health Cards
export async function loadMensHealthCards(): Promise<MensHealthCardData[]> {
    try {
        const cardsJson = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cardsJson) return [];
        return JSON.parse(cardsJson);
    } catch (error) {
        console.error('Error loading Men\'s Health Cards:', error);
        return [];
    }
}

// Update an existing card
export async function updateMensHealthCard(id: string, updatedCard: MensHealthCardData): Promise<void> {
    try {
        const existingCards = await loadMensHealthCards();
        const cardIndex = existingCards.findIndex((card) => card.id === id);

        if (cardIndex === -1) {
            throw new Error('Card not found');
        }

        existingCards[cardIndex] = updatedCard;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existingCards));
    } catch (error) {
        console.error('Error updating Men\'s Health Card:', error);
        throw new Error('Failed to update card');
    }
}

// Delete a card
export async function deleteMensHealthCard(id: string): Promise<void> {
    try {
        const existingCards = await loadMensHealthCards();
        const filteredCards = existingCards.filter((card) => card.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCards));
    } catch (error) {
        console.error('Error deleting Men\'s Health Card:', error);
        throw new Error('Failed to delete card');
    }
}

// Get the most recent card
export async function getMostRecentCard(): Promise<MensHealthCardData | null> {
    try {
        const cards = await loadMensHealthCards();
        if (cards.length === 0) return null;

        // Sort by createdAt date, most recent first
        const sortedCards = cards.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return sortedCards[0];
    } catch (error) {
        console.error('Error getting most recent card:', error);
        return null;
    }
}

// Get the selected card for leaderboard
export async function getSelectedCard(): Promise<MensHealthCardData | null> {
    try {
        const selectedId = await AsyncStorage.getItem(SELECTED_CARD_KEY);
        if (!selectedId) {
            // If no card is selected, return the most recent card as default
            return await getMostRecentCard();
        }

        const cards = await loadMensHealthCards();
        const selectedCard = cards.find(card => card.id === selectedId);

        // If selected card doesn't exist, fall back to most recent
        return selectedCard || await getMostRecentCard();
    } catch (error) {
        console.error('Error getting selected card:', error);
        return await getMostRecentCard();
    }
}

// Set the selected card for leaderboard
export async function setSelectedCard(cardId: string): Promise<void> {
    try {
        await AsyncStorage.setItem(SELECTED_CARD_KEY, cardId);
    } catch (error) {
        console.error('Error setting selected card:', error);
        throw new Error('Failed to select card');
    }
}
