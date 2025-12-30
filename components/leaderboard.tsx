import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../constants/design-system';
import { getSelectedCard } from '../utils/storage';
import { hormoneData, currentUserData as importedCurrentUserData, participantData, semenData, serumFattyAcids, spermFattyAcids } from './data';

// Types for our data structures
interface UserData {
  user_id: string;
  // Semen analysis data
  sperm_concentration: number;
  total_sperm_count: number;
  ejaculate_volume: number;
  sperm_vitality: number;
  normal_spermatozoa: number;
  progressive_motility: number;
  non_progressive_motility: number;
  immotile_sperm: number;
  dna_fragmentation: number;
  hds: number;

  // Hormone data
  testosterone: number;
  fsh: number;
  lh: number;
  inhibin_b: number;
  seminal_amh: number;
  serum_amh: number;

  // Participant data
  age: number;
  bmi: number;
  abstinence_time: number;

  // Fatty acids data
  sperm_dha: number;
  sperm_epa: number;
  sperm_oleic: number;
  serum_dha: number;
  serum_epa: number;

  overall_score: number;
}

interface LeaderboardItem {
  user_id: string;
  overall_score: number;
  rank: number;
  percentile: number;
}

const { width: screenWidth } = Dimensions.get('window');

// Current user ID (in a real app, this would come from auth context)
const CURRENT_USER_ID = 'user_001';

// Comprehensive fertility scoring weights
const WEIGHTS_COMPREHENSIVE = {
  // Semen analysis (40%)
  sperm_concentration: 0.08,
  total_sperm_count: 0.08,
  ejaculate_volume: 0.06,
  sperm_vitality: 0.06,
  normal_spermatozoa: 0.06,
  progressive_motility: 0.06,

  // DNA quality (15%)
  dna_fragmentation: 0.10,
  hds: 0.05,

  // Hormones (20%)
  testosterone: 0.05,
  fsh: 0.05,
  lh: 0.05,
  inhibin_b: 0.05,

  // Fatty acids (10%)
  sperm_dha: 0.03,
  sperm_epa: 0.02,
  serum_dha: 0.03,
  serum_epa: 0.02,

  // Participant factors (15%)
  age: 0.10,
  bmi: 0.05,

  // Additional morphology and seminal factors
  morphology: 0.03,
  dna_quality: 0.07,
  amh: 0.03,
  seminal_amh: 0.02,
  sperm_oleic: 0.02,
};


// Normalize values to 0-100 scale for consistent scoring
const normalizeValue = (value: number, min: number, max: number): number => {
  return ((value - min) / (max - min)) * 100;
};

// Helper function to check if a value is missing or invalid
const isValueMissing = (value: any): boolean => {
  return value === null || value === undefined || value === '' || (typeof value === 'number' && isNaN(value));
};

// Adjust weights proportionally when parameters are missing
const adjustWeightsForMissingData = (
  weights: Record<string, number>,
  availableParams: Record<string, boolean>
): Record<string, number> => {
  const adjustedWeights: Record<string, number> = { ...weights };
  const categories: Record<string, string[]> = {
    semen: ['sperm_concentration', 'total_sperm_count', 'ejaculate_volume', 'sperm_vitality', 'normal_spermatozoa', 'progressive_motility'],
    dna: ['dna_fragmentation', 'hds'],
    hormones: ['testosterone', 'fsh', 'lh', 'inhibin_b'],
    fatty_acids: ['sperm_dha', 'sperm_epa', 'serum_dha', 'serum_epa'],
    participant: ['age', 'bmi'],
  };

  // Adjust weights within each category
  Object.keys(categories).forEach((category: string) => {
    const params = categories[category];
    const availableInCategory = params.filter((p: string) => availableParams[p] !== false);
    const missingInCategory = params.filter((p: string) => availableParams[p] === false);

    if (missingInCategory.length > 0 && availableInCategory.length > 0) {
      // Calculate total weight of missing parameters in this category
      const missingWeight = missingInCategory.reduce((sum: number, param: string) => sum + (weights[param] || 0), 0);
      const availableWeight = availableInCategory.reduce((sum: number, param: string) => sum + (weights[param] || 0), 0);

      // Redistribute missing weight proportionally among available parameters
      if (availableWeight > 0) {
        availableInCategory.forEach((param: string) => {
          const originalWeight = weights[param] || 0;
          const proportionalShare = missingWeight * (originalWeight / availableWeight);
          adjustedWeights[param] = originalWeight + proportionalShare;
        });
      }

      // Set missing parameters to 0
      missingInCategory.forEach((param: string) => {
        adjustedWeights[param] = 0;
      });
    }
  });

  return adjustedWeights;
};

// Calculate data completeness score (0-100%)
const calculateDataCompleteness = (availableParams: Record<string, boolean>, totalParams: number): number => {
  const availableCount = Object.keys(availableParams).filter((key: string) => availableParams[key] !== false).length;
  return (availableCount / totalParams) * 100;
};

// Calculate percentile rank
const calculatePercentile = (score: number, allScores: number[]): number => {
  const sortedScores = [...allScores].sort((a, b) => a - b);
  const index = sortedScores.findIndex(s => s >= score);
  return (index / sortedScores.length) * 100;
};

export default function Leaderboard() {
  const [userData, setUserData] = useState<UserData[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartView, setChartView] = useState<'bell' | 'histogram'>('bell');
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [mensHealthCard, setMensHealthCard] = useState<any>(null);

  // Load and merge data from all 5 CSV files
  useEffect(() => {
    const loadCSVData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Set current user data from embedded data
        setCurrentUserData(importedCurrentUserData);

        // Using complete fatty acid data imported from data.ts

        // Merge all data by ID
        const mergedData = (semenData as any[]).map((semenItem: any) => {
          const id = semenItem.ID;
          const hormoneItem = (hormoneData as any[]).find(h => h.ID === id) || {};
          const participantItem = (participantData as any[]).find(p => p.ID === id) || {};
          const spermFAItem = (spermFattyAcids as any[]).find(f => f.ID === id) || {};
          const serumFAItem = (serumFattyAcids as any[]).find(f => f.ID === id) || {};

          return {
            user_id: id.toString(),
            // Semen analysis data
            sperm_concentration: semenItem['Sperm concentration (x10â¶/mL)'] || 0,
            total_sperm_count: semenItem['Total sperm count (x10â¶)'] || 0,
            ejaculate_volume: semenItem['Ejaculate volume (mL)'] || 0,
            sperm_vitality: semenItem['Sperm vitality (%)'] || 0,
            normal_spermatozoa: semenItem['Normal spermatozoa (%)'] || 0,
            progressive_motility: semenItem['Progressive motility (%)'] || 0,
            non_progressive_motility: semenItem['Non progressive sperm motility (%)'] || 0,
            immotile_sperm: semenItem['Immotile sperm (%)'] || 0,
            dna_fragmentation: semenItem['DNA fragmentation index, DFI (%)'] || 0,
            hds: semenItem['High DNA stainability, HDS (%)'] || 0,

            // Hormone data
            testosterone: hormoneItem['Serum total testosterone (nmol/L)'] || 0,
            fsh: hormoneItem['Serum follicle-stimulating hormone, FSH (IU/L)'] || 0,
            lh: hormoneItem['Serum Luteinizing hormone, LH (IU/L)'] || 0,
            inhibin_b: hormoneItem['Serum inhibin B (ng/L)'] || 0,
            seminal_amh: hormoneItem['Seminal plasma anti-MÃ¼llerian hormone (AMH) (pmol/L)'] || 0,
            serum_amh: hormoneItem['Serum anti-MÃ¼llerian hormone, AMH (pmol/L)'] || 0,

            // Participant data
            age: participantItem['Age (years)'] || 0,
            bmi: participantItem['Body mass index (kg/mÂ²)'] || 0,
            abstinence_time: participantItem['Abstinence time(days)'] || 0,

            // Fatty acids data (key ones)
            sperm_dha: spermFAItem['Sperm C22:6,n3 (docosahexaenoic acid, DHA)'] || 0,
            sperm_epa: spermFAItem['Sperm C20:5 n-3 (eicosapentaenoic acid, EPA)'] || 0,
            sperm_oleic: spermFAItem['Sperm C18:1 n-9 (oleic acid)'] || 0,
            serum_dha: serumFAItem['Serum C22:6 n-3 (docosahexaenoic acid, DHA)'] || 0,
            serum_epa: serumFAItem['Serum C20:5 n-3  (eicosapentaenoic acid, EPA)'] || 0,

            overall_score: 0,
          };
        });

        // Calculate comprehensive fertility scores
        const dataWithScores: UserData[] = mergedData.map((user: any) => {
          // Check which parameters are available (handle both new _available field and legacy || 0 pattern)
          const availableParams = user._available || {
            sperm_concentration: user.sperm_concentration !== null && user.sperm_concentration !== undefined && !isNaN(user.sperm_concentration),
            total_sperm_count: user.total_sperm_count !== null && user.total_sperm_count !== undefined && !isNaN(user.total_sperm_count),
            ejaculate_volume: user.ejaculate_volume !== null && user.ejaculate_volume !== undefined && !isNaN(user.ejaculate_volume),
            sperm_vitality: user.sperm_vitality !== null && user.sperm_vitality !== undefined && !isNaN(user.sperm_vitality),
            normal_spermatozoa: user.normal_spermatozoa !== null && user.normal_spermatozoa !== undefined && !isNaN(user.normal_spermatozoa),
            progressive_motility: user.progressive_motility !== null && user.progressive_motility !== undefined && !isNaN(user.progressive_motility),
            dna_fragmentation: user.dna_fragmentation !== null && user.dna_fragmentation !== undefined && !isNaN(user.dna_fragmentation),
            hds: user.hds !== null && user.hds !== undefined && !isNaN(user.hds),
            testosterone: user.testosterone !== null && user.testosterone !== undefined && !isNaN(user.testosterone) && user.testosterone > 0,
            fsh: user.fsh !== null && user.fsh !== undefined && !isNaN(user.fsh) && user.fsh > 0,
            lh: user.lh !== null && user.lh !== undefined && !isNaN(user.lh) && user.lh > 0,
            inhibin_b: user.inhibin_b !== null && user.inhibin_b !== undefined && !isNaN(user.inhibin_b) && user.inhibin_b > 0,
            age: user.age !== null && user.age !== undefined && !isNaN(user.age) && user.age > 0,
            bmi: user.bmi !== null && user.bmi !== undefined && !isNaN(user.bmi) && user.bmi > 0,
            sperm_dha: user.sperm_dha !== null && user.sperm_dha !== undefined && !isNaN(user.sperm_dha),
            sperm_epa: user.sperm_epa !== null && user.sperm_epa !== undefined && !isNaN(user.sperm_epa),
            serum_dha: user.serum_dha !== null && user.serum_dha !== undefined && !isNaN(user.serum_dha),
            serum_epa: user.serum_epa !== null && user.serum_epa !== undefined && !isNaN(user.serum_epa),
          };

          // Normalize semen analysis metrics (higher = better) - only if value is available


          // Normalize semen analysis metrics (higher = better) - only if value is available
          const normalizedConcentration = availableParams.sperm_concentration ? normalizeValue(user.sperm_concentration, 0, 200) : 0;
          const normalizedCount = availableParams.total_sperm_count ? normalizeValue(user.total_sperm_count, 0, 300) : 0;
          const normalizedVolume = availableParams.ejaculate_volume ? normalizeValue(user.ejaculate_volume, 1.5, 6) : 0;
          const normalizedVitality = availableParams.sperm_vitality ? normalizeValue(user.sperm_vitality, 50, 90) : 0;
          const normalizedNormalSperm = availableParams.normal_spermatozoa ? normalizeValue(user.normal_spermatozoa, 4, 15) : 0;
          const normalizedProgressiveMotility = availableParams.progressive_motility ? normalizeValue(user.progressive_motility, 30, 70) : 0;

          // DNA quality metrics (lower = better) - only if value is available
          const normalizedDNAFragmentation = availableParams.dna_fragmentation ? (100 - normalizeValue(user.dna_fragmentation, 0, 30)) : 0;
          const normalizedHDS = availableParams.hds ? (100 - normalizeValue(user.hds, 0, 30)) : 0;

          // Hormone levels (optimal ranges) - only if value is available
          const normalizedTestosterone = availableParams.testosterone ? normalizeValue(user.testosterone, 10, 35) : 0;
          const normalizedFSH = availableParams.fsh ? (100 - normalizeValue(user.fsh, 1, 12)) : 0; // Lower FSH is better
          const normalizedLH = availableParams.lh ? normalizeValue(user.lh, 1.5, 9) : 0;
          const normalizedInhibinB = availableParams.inhibin_b ? normalizeValue(user.inhibin_b, 50, 300) : 0;

          // Fatty acids (higher omega-3s = better) - only if value is available
          const normalizedSpermDHA = availableParams.sperm_dha ? normalizeValue(user.sperm_dha, 0, 30) : 0;
          const normalizedSpermEPA = availableParams.sperm_epa ? normalizeValue(user.sperm_epa, 0, 10) : 0;
          const normalizedSerumDHA = availableParams.serum_dha ? normalizeValue(user.serum_dha, 2, 10) : 0;
          const normalizedSerumEPA = availableParams.serum_epa ? normalizeValue(user.serum_epa, 0.5, 4) : 0;

          // Participant factors (age and BMI - optimal ranges) - only if value is available
          const normalizedAge = availableParams.age ? (100 - normalizeValue(Math.abs(user.age - 30), 0, 20)) : 0; // Closer to 30 is better
          const normalizedBMI = availableParams.bmi ? (100 - normalizeValue(Math.abs(user.bmi - 22), 0, 10)) : 0; // Closer to 22 is better

          // Optimized weights based on fertility research
          // Research shows DNA fragmentation is one of the strongest predictors
          // Total sperm count is more predictive than concentration alone
          const WEIGHTS_COMPREHENSIVE = {
            // Semen analysis (35%) - Foundation, slightly reduced
            sperm_concentration: 0.06,  // Reduced from 0.08
            total_sperm_count: 0.10,    // Increased from 0.08 (more predictive)
            ejaculate_volume: 0.04,     // Reduced from 0.06
            sperm_vitality: 0.05,       // Reduced from 0.06
            normal_spermatozoa: 0.05,   // Reduced from 0.06
            progressive_motility: 0.05, // Reduced from 0.06

            // DNA quality (25%) - Significantly increased (critical predictor)
            dna_fragmentation: 0.18,    // Increased from 0.10 (most important)
            hds: 0.07,                  // Increased from 0.05

            // Hormones (18%) - Rebalanced, emphasis on predictive factors
            testosterone: 0.06,         // Increased from 0.05
            fsh: 0.03,                  // Reduced from 0.05
            lh: 0.04,                   // Reduced from 0.05
            inhibin_b: 0.05,            // Same (important marker)

            // Fatty acids (8%) - Slightly reduced
            sperm_dha: 0.03,            // Same
            sperm_epa: 0.02,            // Same
            serum_dha: 0.02,            // Reduced from 0.03
            serum_epa: 0.01,            // Reduced from 0.02

            // Participant factors (14%) - Slightly reduced
            age: 0.10,                  // Same (critical factor)
            bmi: 0.04,                  // Reduced from 0.05
          };

          // Adjust weights for missing data (proportional redistribution within categories)
          const adjustedWeights = adjustWeightsForMissingData(WEIGHTS_COMPREHENSIVE, availableParams);

          // Calculate comprehensive fertility score using adjusted weights
          const overall_score =
            normalizedConcentration * adjustedWeights.sperm_concentration +
            normalizedCount * adjustedWeights.total_sperm_count +
            normalizedVolume * adjustedWeights.ejaculate_volume +
            normalizedVitality * adjustedWeights.sperm_vitality +
            normalizedNormalSperm * adjustedWeights.normal_spermatozoa +
            normalizedProgressiveMotility * adjustedWeights.progressive_motility +
            normalizedDNAFragmentation * adjustedWeights.dna_fragmentation +
            normalizedHDS * adjustedWeights.hds +
            normalizedTestosterone * adjustedWeights.testosterone +
            normalizedFSH * adjustedWeights.fsh +
            normalizedLH * adjustedWeights.lh +
            normalizedInhibinB * adjustedWeights.inhibin_b +
            normalizedSpermDHA * adjustedWeights.sperm_dha +
            normalizedSpermEPA * adjustedWeights.sperm_epa +
            normalizedSerumDHA * adjustedWeights.serum_dha +
            normalizedSerumEPA * adjustedWeights.serum_epa +
            normalizedAge * adjustedWeights.age +
            normalizedBMI * adjustedWeights.bmi;

          // Calculate data completeness (percentage of available parameters)
          const totalParams = 18; // Total number of scoring parameters
          const dataCompleteness = calculateDataCompleteness(availableParams, totalParams);

          return {
            ...user,
            overall_score,
            _available: availableParams,
            _data_completeness: dataCompleteness,
          };
        });

        // Sort by overall score and create leaderboard
        const sortedData = dataWithScores.sort((a, b) => b.overall_score - a.overall_score);
        let allScores = sortedData.map(d => d.overall_score);

        // Load selected Men's Health Card
        let cardScore = null;
        try {
          const selectedCard = await getSelectedCard();
          setMensHealthCard(selectedCard);

          if (selectedCard) {
            // Convert Men's Health Index (0-100) to leaderboard score scale
            // The leaderboard uses a different scoring system, so we normalize
            cardScore = selectedCard.overallHealthIndex;

            // Add card score to all scores for percentile calculation
            allScores = [...allScores, cardScore];
          }
        } catch (cardError) {
          console.log('No Men\'s Health Card data available');
        }

        const leaderboard: LeaderboardItem[] = sortedData.map((user, index) => ({
          user_id: user.user_id,
          overall_score: user.overall_score,
          rank: index + 1,
          percentile: calculatePercentile(user.overall_score, allScores),
        }));

        // Add current user from health card if available
        if (cardScore !== null) {
          const currentUserRank = allScores.filter(s => s > cardScore).length + 1;
          leaderboard.push({
            user_id: 'current_user',
            overall_score: cardScore,
            rank: currentUserRank,
            percentile: calculatePercentile(cardScore, allScores),
          });

          // Re-sort leaderboard including current user
          leaderboard.sort((a, b) => b.overall_score - a.overall_score);

          // Update ranks after adding current user
          leaderboard.forEach((item, index) => {
            item.rank = index + 1;
          });
        }

        setUserData(dataWithScores);
        setLeaderboardData(leaderboard);
        setIsLoading(false);

      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard data');
        setIsLoading(false);
      }
    };

    loadCSVData();
  }, []);

  // Generate chart data for visualization - frequency-based distribution with smooth connecting line
  const generateChartData = () => {
    if (userData.length === 0) return { labels: [], datasets: [] };

    const scores = userData.map(d => d.overall_score);
    const maxScore = Math.max(...scores);
    // Ensure maxScore is reasonable (should be < 100 for sperm scores)
    const safeMaxScore = Math.min(maxScore, 100);

    // Create exactly 10 bins for frequency distribution from 0 to safeMaxScore
    const numBins = 10;
    const binSize = safeMaxScore / numBins;
    const bins: { [key: number]: number } = {};

    // Create exactly 11 bin edges (0, binSize, 2*binSize, ..., 10*binSize)
    for (let i = 0; i <= numBins; i++) {
      const binEdge = i * binSize;
      bins[binEdge] = 0;
    }

    // Count scores in each bin
    scores.forEach(score => {
      const binKey = Math.floor(score / binSize) * binSize;
      bins[binKey] = (bins[binKey] || 0) + 1;
    });

    // Create chart data - include all bins for smooth line
    const labels: string[] = [];
    const dataPoints: number[] = [];

    const sortedBinKeys = Object.keys(bins).map(k => parseFloat(k)).sort((a, b) => a - b);

    // Ensure the rightmost bin is exactly safeMaxScore
    if (sortedBinKeys.length > 0) {
      const lastKey = sortedBinKeys[sortedBinKeys.length - 1];
      if (lastKey !== safeMaxScore) {
        // Replace with safeMaxScore and preserve any existing count
        const existingCount = bins[safeMaxScore] || bins[lastKey] || 0;
        sortedBinKeys[sortedBinKeys.length - 1] = safeMaxScore;
        bins[safeMaxScore] = existingCount;
      }
    }

    // Create labels from the evenly spaced bin positions
    sortedBinKeys.forEach((binStart, index) => {
      // Display the actual bin positions (already evenly spaced relative to max score)
      labels.push(binStart.toFixed(1));
      dataPoints.push(bins[binStart] || 0);
    });

    // Calculate current user overall score and percentile from Men's Health Card
    let currentUserPoint = null;
    if (mensHealthCard) {
      // Use the Men's Health Card overall health index directly
      const currentUserScore = mensHealthCard.overallHealthIndex;

      const allScores = [...scores, currentUserScore].sort((a, b) => a - b);
      const currentUserRank = allScores.indexOf(currentUserScore) + 1;
      const percentile = ((currentUserRank - 1) / allScores.length) * 100;

      const binKey = Math.floor(currentUserScore / binSize) * binSize;
      currentUserPoint = {
        x: currentUserScore,
        y: bins[binKey] || 0,
        percentile: percentile.toFixed(1),
        score: currentUserScore.toFixed(1),
      };
    }

    return {
      labels,
      datasets: [{
        data: dataPoints,
        color: () => Colors.black,
        strokeWidth: 2,
      }],
      // Individual scores plotted as dots at their frequency height
      userPoints: scores.map(score => {
        const binKey = Math.floor(score / binSize) * binSize;
        return {
          x: score,
          y: bins[binKey] || 0,
        };
      }),
      // Current user point with percentile
      currentUserPoint,
      // Bin size and max score for positioning calculations
      binSize,
      maxScore: safeMaxScore,
    };
  };

  // Generate number line data for individual points view
  const generateNumberLineData = () => {
    if (userData.length === 0) return { labels: [], datasets: [] };

    const scores = userData.map(d => d.overall_score);
    const minScore = 0; // Start at 0
    const maxScore = Math.ceil(Math.max(...scores)); // End at max score

    // Create evenly spaced labels for the number line
    const labels = [];
    for (let i = minScore; i <= maxScore; i += 5) {
      labels.push(i.toString());
    }

    // Create a flat line (y=1) for the number line
    const data = Array(labels.length).fill(1);

    return {
      labels,
      datasets: [{
        data,
        color: () => '#E5E5E5', // Light gray for the number line
        strokeWidth: 1,
      }],
      // Individual user points positioned along the number line
      userPoints: scores.map(score => ({
        x: score,
        y: 1, // All points on the same horizontal line
      })),
    };
  };

  const currentUser = leaderboardData.find(item => item.user_id === CURRENT_USER_ID);
  const currentUserScore = mensHealthCard ? mensHealthCard.overallHealthIndex : null;
  const chartData = generateChartData();
  const numberLineData = generateNumberLineData();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.black} />
        <Text style={styles.loadingText}>Loading leaderboard data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Fertility Score </Text>
          <Text style={styles.subtitle}>See how you compare to other men</Text>
        </View>

        {/* Current User Card */}
        {currentUser && (
          <View style={styles.currentUserCard}>
            <Text style={styles.currentUserTitle}>Your Position</Text>
            <Text style={styles.currentUserScore}>
              Rank #{currentUser.rank} • {currentUser.overall_score.toFixed(1)} points
            </Text>
            <Text style={styles.currentUserPercentile}>
              Top {currentUser.percentile.toFixed(1)}% of users
            </Text>
          </View>
        )}

        {/* Current User Detailed Metrics */}
        {currentUserData && (
          <View style={styles.currentUserMetrics}>
            <Text style={styles.metricsTitle}>Your Stats</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Sperm Count</Text>
                <Text style={styles.metricValue}>{currentUserData['Total sperm count (x10â¶)']}M</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Motility</Text>
                <Text style={styles.metricValue}>{currentUserData['Progressive motility (%)']}%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Testosterone</Text>
                <Text style={styles.metricValue}>{(currentUserData['Serum total testosterone (nmol/L)'] * 28.8).toFixed(0)} ng/dL</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>DNA Quality</Text>
                <Text style={styles.metricValue}>{(100 - currentUserData['DNA fragmentation index, DFI (%)']).toFixed(0)}%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>DHA Level</Text>
                <Text style={styles.metricValue}>{currentUserData['Sperm C22:6,n3 (docosahexaenoic acid, DHA)']}%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Age</Text>
                <Text style={styles.metricValue}>{currentUserData['Age (years)']} years</Text>
              </View>
            </View>

            {/* Men's Health Card Section */}
            {mensHealthCard && (
              <>
                <Text style={[styles.metricsTitle, { marginTop: 20 }]}>Men's Health Card</Text>
                <View style={styles.metricsGrid}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Health Index</Text>
                    <Text style={styles.metricValue}>{mensHealthCard.overallHealthIndex}/100</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Sperm Conc.</Text>
                    <Text style={styles.metricValue}>{mensHealthCard.semenQuality.spermConcentration}M/mL</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Lifestyle</Text>
                    <Text style={styles.metricValue}>{Math.round(mensHealthCard.lifestyleScore)}/100</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Smoking</Text>
                    <Text style={styles.metricValue}>{mensHealthCard.lifestyle.smokingStatus}</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Exercise</Text>
                    <Text style={styles.metricValue}>{mensHealthCard.lifestyle.weeklyExerciseMinutes}min/wk</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Sleep</Text>
                    <Text style={styles.metricValue}>{mensHealthCard.lifestyle.sleepHoursPerNight}hrs</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        {/* Score Distribution Chart with Toggle */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Score Distribution</Text>

          {/* Toggle Buttons */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, chartView === 'bell' && styles.toggleButtonActive]}
              onPress={() => setChartView('bell')}
            >
              <Text style={[styles.toggleButtonText, chartView === 'bell' && styles.toggleButtonTextActive]}>
                Distribution
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, chartView === 'histogram' && styles.toggleButtonActive]}
              onPress={() => setChartView('histogram')}
            >
              <Text style={[styles.toggleButtonText, chartView === 'histogram' && styles.toggleButtonTextActive]}>
                Number Line
              </Text>
            </TouchableOpacity>
          </View>

          {chartView === 'bell' ? (
            <View style={{ overflow: 'visible', paddingHorizontal: 20 }}>
              {/* Current User Marker - Above Chart */}
              {chartData.currentUserPoint && (
                <View style={styles.currentUserMarkerAboveChart}>
                  <View style={styles.currentUserMarker}>
                    <Text style={styles.currentUserMarkerText}>You</Text>
                    <Text style={styles.currentUserMarkerScore}>
                      {chartData.currentUserPoint.score} points
                    </Text>
                    <Text style={styles.currentUserPercentile}>
                      {chartData.currentUserPoint.percentile}th percentile
                    </Text>
                  </View>
                </View>
              )}

              <View style={{ marginLeft: -55, width: screenWidth }}>
                <LineChart
                  data={chartData}
                  width={screenWidth + 40}
                  height={180}
                  chartConfig={{
                    backgroundColor: Colors.white,
                    backgroundGradientFrom: Colors.white,
                    backgroundGradientTo: Colors.white,
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 0,
                    },
                    propsForDots: {
                      r: '4', // Show dots for individual data points
                      fill: '#007AFF',
                    },
                  }}
                  style={{
                    marginVertical: 8,
                    borderRadius: 0,
                  }}
                  bezier={true}
                  withDots={false}
                  withInnerLines={false}
                  withOuterLines={false}
                  withHorizontalLabels={false}
                />

                {/* Current User Red Dot on Chart */}
                {chartData.currentUserPoint && (
                  <View style={styles.currentUserDotOnChart}>
                    <View
                      style={[
                        styles.currentUserDot,
                        {
                          left: `${(chartData.currentUserPoint.x / chartData.maxScore) * 100 * 1.082}%`,
                          bottom: `14%`,
                        },
                      ]}
                    />
                  </View>
                )}
              </View>
              <Text style={styles.chartCaption}>
                Sperm Score distribution of all users
              </Text>
            </View>
          ) : (
            <View>
              {/* Current User Marker - Above Number Line */}
              {chartData.currentUserPoint && (
                <View style={styles.currentUserMarkerAboveChart}>
                  <View style={styles.currentUserMarker}>
                    <Text style={styles.currentUserMarkerText}>You</Text>
                    <Text style={styles.currentUserMarkerScore}>
                      {chartData.currentUserPoint.score} points
                    </Text>
                    <Text style={styles.currentUserPercentile}>
                      {chartData.currentUserPoint.percentile}th percentile
                    </Text>
                  </View>
                </View>
              )}

              {/* Invisible chart for coordinate system only */}
              <View style={{ height: 20, backgroundColor: 'transparent' }} />
              {/* Visible horizontal line through the dots */}
              <View style={styles.numberLine}>
                <View style={styles.numberLineBar} />
              </View>

              {/* Number labels below the line */}
              <View style={styles.numberLineLabels}>
                {numberLineData.labels.map((label, index) => (
                  <Text key={index} style={styles.numberLineLabel}>
                    {label}
                  </Text>
                ))}
              </View>

              {/* Individual user points on number line */}
              <View style={styles.numberLineContainer}>
                {numberLineData.userPoints?.map((point, index) => {
                  // Use the same minScore (0) and maxScore as the labels
                  const minScore = 0;
                  const maxScore = Math.ceil(Math.max(...userData.map(d => d.overall_score)));
                  const scoreRange = maxScore - minScore;
                  const position = scoreRange > 0 ? ((point.x - minScore) / scoreRange) * 100 : 50;

                  return (
                    <View
                      key={index}
                      style={[
                        styles.numberLinePoint,
                        Math.abs(point.x - (currentUserScore || 0)) < 0.5 && styles.numberLineCurrentUserPoint,
                        { left: `${Math.max(0, Math.min(100, position))}%` },
                      ]}
                    />
                  );
                })}
              </View>
              <Text style={styles.chartCaption}>
                Sperm Score distribution of all users
              </Text>
            </View>
          )}

          <View style={styles.currentUserIndicator}>
            {currentUser && (
              <View style={styles.currentUserMarker}>
                <Text style={styles.currentUserMarkerText}>
                  Your Position: {currentUser.overall_score.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Leaderboard List */}
        <View style={styles.leaderboardContainer}>
          <Text style={styles.leaderboardTitle}>Top Performers</Text>
          {leaderboardData.slice(0, 10).map((item) => (
            <View
              key={item.user_id}
              style={[
                styles.leaderboardItem,
                item.user_id === CURRENT_USER_ID && styles.currentUserHighlight,
              ]}
            >
              <View style={styles.rankContainer}>
                <Text style={[
                  styles.rank,
                  item.rank <= 3 && styles.topRank,
                ]}>
                  #{item.rank}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userId}>
                  {item.user_id === CURRENT_USER_ID ? 'You' : item.user_id}
                </Text>
                <Text style={styles.score}>{item.overall_score.toFixed(1)} pts</Text>
              </View>
              <Text style={styles.percentile}>
                Top {item.percentile.toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  loadingText: {
    marginTop: Spacing.base,
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    fontSize: Typography.size.base,
    color: Colors.error,
    textAlign: 'center',
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    color: Colors.black,
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
  },
  currentUserCard: {
    margin: Spacing.base,
    padding: Spacing.base,
    backgroundColor: Colors.black,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  currentUserTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  currentUserScore: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  chartContainer: {
    marginHorizontal: Spacing.xs,
    marginVertical: Spacing.base,
    padding: Spacing.xs,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  chartTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.black,
    marginBottom: Spacing.base,
    textAlign: 'center',
  },
  chartCaption: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  leaderboardContainer: {
    margin: Spacing.base,
    marginTop: 0,
  },
  leaderboardTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.black,
    marginBottom: Spacing.md,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  currentUserHighlight: {
    borderWidth: 2,
    borderColor: Colors.black,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rank: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.textSecondary,
  },
  topRank: {
    color: Colors.black,
  },
  userInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  userId: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.black,
  },
  score: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  percentile: {
    fontSize: Typography.size.sm,
    color: Colors.black,
    fontWeight: Typography.weight.medium,
  },
  currentUserIndicator: {
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  numberLine: {
    position: 'absolute',
    top: 82,
    left: Spacing.base,
    right: Spacing.base,
    height: 2,
    justifyContent: 'center',
  },
  numberLineBar: {
    height: 2,
    backgroundColor: Colors.grey300,
    opacity: 0.8,
  },
  numberLineContainer: {
    position: 'absolute',
    top: 72,
    left: Spacing.base,
    right: Spacing.base,
    height: 40,
    alignItems: 'center',
  },
  numberLineLabels: {
    position: 'absolute',
    top: 95,
    left: Spacing.base,
    right: Spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  numberLineLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  numberLinePoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.grey500,
    opacity: 0.7,
    top: 8,
  },
  numberLineCurrentUserPoint: {
    backgroundColor: Colors.black,
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 1,
    top: 7,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginVertical: Spacing.md,
    backgroundColor: Colors.grey100,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Colors.black,
  },
  toggleButtonText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    color: Colors.textSecondary,
  },
  toggleButtonTextActive: {
    color: Colors.white,
  },
  currentUserMetrics: {
    margin: Spacing.base,
    marginTop: 0,
    padding: Spacing.base,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricsTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.black,
    marginBottom: Spacing.md,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  metricLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.black,
    textAlign: 'center',
  },
  currentUserMarkerContainer: {
    position: 'absolute',
    top: 8,
    left: -55,
    width: screenWidth + 40,
    height: 180,
    pointerEvents: 'none',
  },
  currentUserMarkerAboveChart: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  currentUserMarker: {
    backgroundColor: Colors.black,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    ...Shadows.lg,
    minWidth: 80,
    alignItems: 'center',
  },
  currentUserMarkerText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: Colors.white,
    textAlign: 'center',
  },
  currentUserMarkerScore: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.white,
    textAlign: 'center',
    marginTop: 2,
  },
  currentUserPercentile: {
    fontSize: Typography.size.xs,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  currentUserDotOnChart: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    height: 180,
    pointerEvents: 'none',
  },
  currentUserDot: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.black,
    ...Shadows.sm,
  },
});