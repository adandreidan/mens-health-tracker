# PoSperMoN Scoring System Breakdown (Updated)

## Overview
The scoring system calculates a comprehensive fertility score (0-100 scale) based on multiple biological factors from embedded research data. The score is used to rank donors and generate graded Pokemon-style cards.

## Data Architecture (Updated)

### Data Source
- **Embedded Data**: Data is now embedded as JavaScript/TypeScript objects in `components/data.ts` instead of loading from CSV files
- **Data Files**: 
  - `hormoneData` - Sex hormone measurements
  - `semenData` - Semen analysis results
  - `participantData` - Participant demographics and lifestyle factors
  - `spermFattyAcids` - Fatty acid composition in sperm
  - `serumFattyAcids` - Fatty acid composition in blood serum
  - `currentUserData` - Sample current user data for display

### Data Merging
Data is merged by ID across all datasets in the `leaderboard.tsx` component:
```typescript
const mergedData = semenData.map((semenItem) => {
  const id = semenItem.ID;
  const hormoneItem = hormoneData.find(h => h.ID === id) || {};
  const participantItem = participantData.find(p => p.ID === id) || {};
  const spermFAItem = spermFattyAcids.find(f => f.ID === id) || {};
  const serumFAItem = serumFattyAcids.find(f => f.ID === id) || {};
  // Merge all data...
});
```

## Scoring Process

### Step 1: Data Normalization
All raw values are normalized to a 0-100 scale using the `normalizeValue()` function:

```typescript
normalizeValue(value, min, max) = ((value - min) / (max - min)) * 100
```

This ensures all metrics are on the same scale for comparison.

### Step 2: Category-Specific Normalization

#### A. Semen Analysis Metrics (Higher = Better)
- **Sperm Concentration**: Normalized from 0-200 (x10⁶/mL)
  - Raw field: `'Sperm concentration (x10â¶/mL)'`
- **Total Sperm Count**: Normalized from 0-300 (x10⁶)
  - Raw field: `'Total sperm count (x10â¶)'`
- **Ejaculate Volume**: Normalized from 1.5-6 (mL)
  - Raw field: `'Ejaculate volume (mL)'`
- **Sperm Vitality**: Normalized from 50-90 (%)
  - Raw field: `'Sperm vitality (%)'`
- **Normal Spermatozoa**: Normalized from 4-15 (%)
  - Raw field: `'Normal spermatozoa (%)'`
- **Progressive Motility**: Normalized from 30-70 (%)
  - Raw field: `'Progressive motility (%)'`

#### B. DNA Quality Metrics (Lower = Better, so inverted)
- **DNA Fragmentation Index (DFI)**: Normalized from 0-30%, then inverted (100 - normalized)
  - Raw field: `'DNA fragmentation index, DFI (%)'`
  - Formula: `100 - normalizeValue(dna_fragmentation, 0, 30)`
- **High DNA Stainability (HDS)**: Normalized from 0-30%, then inverted (100 - normalized)
  - Raw field: `'High DNA stainability, HDS (%)'`
  - Formula: `100 - normalizeValue(hds, 0, 30)`

#### C. Hormone Levels (Optimal Ranges)
- **Testosterone**: Normalized from 10-35 (nmol/L)
  - Raw field: `'Serum total testosterone (nmol/L)'`
- **FSH (Follicle-Stimulating Hormone)**: Normalized from 1-12 (IU/L), then inverted (lower is better)
  - Raw field: `'Serum follicle-stimulating hormone, FSH (IU/L)'`
  - Formula: `100 - normalizeValue(fsh, 1, 12)`
- **LH (Luteinizing Hormone)**: Normalized from 1.5-9 (IU/L)
  - Raw field: `'Serum Luteinizing hormone, LH (IU/L)'`
- **Inhibin B**: Normalized from 50-300 (ng/L)
  - Raw field: `'Serum inhibin B (ng/L)'`

#### D. Fatty Acids (Higher Omega-3s = Better)
- **Sperm DHA**: Normalized from 0-30 (%)
  - Raw field: `'Sperm C22:6,n3 (docosahexaenoic acid, DHA)'`
- **Sperm EPA**: Normalized from 0-10 (%)
  - Raw field: `'Sperm C20:5 n-3 (eicosapentaenoic acid, EPA)'`
- **Serum DHA**: Normalized from 2-10 (%)
  - Raw field: `'Serum C22:6 n-3 (docosahexaenoic acid, DHA)'`
- **Serum EPA**: Normalized from 0.5-4 (%)
  - Raw field: `'Serum C20:5 n-3  (eicosapentaenoic acid, EPA)'`

#### E. Participant Factors (Optimal Ranges)
- **Age**: Distance from optimal age (30 years), normalized from 0-20 years difference, then inverted
  - Raw field: `'Age (years)'`
  - Formula: `100 - normalizeValue(Math.abs(age - 30), 0, 20)`
  - Closer to 30 years is better
- **BMI**: Distance from optimal BMI (22), normalized from 0-10 difference, then inverted
  - Raw field: `'Body mass index (kg/m²)'`
  - Formula: `100 - normalizeValue(Math.abs(bmi - 22), 0, 10)`
  - Closer to 22 is better

### Step 3: Weighted Scoring System

The overall score is calculated using weighted contributions from each category:

#### Weight Distribution (Total = 100%)

**Semen Analysis (40%)**
- Sperm Concentration: 8% (weight: 0.08)
- Total Sperm Count: 8% (weight: 0.08)
- Ejaculate Volume: 6% (weight: 0.06)
- Sperm Vitality: 6% (weight: 0.06)
- Normal Spermatozoa: 6% (weight: 0.06)
- Progressive Motility: 6% (weight: 0.06)

**DNA Quality (15%)**
- DNA Fragmentation: 10% (weight: 0.10)
- HDS: 5% (weight: 0.05)

**Hormones (20%)**
- Testosterone: 5% (weight: 0.05)
- FSH: 5% (weight: 0.05)
- LH: 5% (weight: 0.05)
- Inhibin B: 5% (weight: 0.05)

**Fatty Acids (10%)**
- Sperm DHA: 3% (weight: 0.03)
- Sperm EPA: 2% (weight: 0.02)
- Serum DHA: 3% (weight: 0.03)
- Serum EPA: 2% (weight: 0.02)

**Participant Factors (15%)**
- Age: 10% (weight: 0.10)
- BMI: 5% (weight: 0.05)

### Step 4: Overall Score Calculation

```typescript
overall_score = 
  (normalizedConcentration × 0.08) +
  (normalizedCount × 0.08) +
  (normalizedVolume × 0.06) +
  (normalizedVitality × 0.06) +
  (normalizedNormalSperm × 0.06) +
  (normalizedProgressiveMotility × 0.06) +
  (normalizedDNAFragmentation × 0.10) +
  (normalizedHDS × 0.05) +
  (normalizedTestosterone × 0.05) +
  (normalizedFSH × 0.05) +
  (normalizedLH × 0.05) +
  (normalizedInhibinB × 0.05) +
  (normalizedSpermDHA × 0.03) +
  (normalizedSpermEPA × 0.02) +
  (normalizedSerumDHA × 0.03) +
  (normalizedSerumEPA × 0.02) +
  (normalizedAge × 0.10) +
  (normalizedBMI × 0.05)
```

## Score Interpretation

### Score Range
- **0-100**: Continuous scale (not discrete)
- Higher scores indicate better overall fertility profile
- Scores are relative to the dataset (percentile ranking available)

### Percentile Calculation
Each user's score is ranked against all other users:
```typescript
calculatePercentile(score, allScores) {
  const sortedScores = [...allScores].sort((a, b) => a - b);
  const index = sortedScores.findIndex(s => s >= score);
  return (index / sortedScores.length) * 100;
}
```

### Leaderboard Ranking
- Scores are sorted in descending order (highest first)
- Each user gets a rank (1, 2, 3, etc.)
- Percentile shows what percentage of users have equal or lower scores

## Visualization Features

### Score Distribution Charts
1. **Bell Curve View**: Shows statistical distribution of scores using a normal distribution approximation
2. **Number Line View**: Shows individual user positions on a number line

### Current User Display
- Current user is highlighted with a special marker (red dot on number line)
- Shows rank, score, and percentile
- Displays key metrics in a grid format

## Key Design Decisions

1. **Weighted Approach**: Semen analysis gets the highest weight (40%) as it's the most direct indicator of fertility
2. **Inverted Metrics**: Some metrics where lower is better (DFI, HDS, FSH) are inverted during normalization
3. **Optimal Ranges**: Age and BMI use distance from optimal values rather than linear scaling
4. **Comprehensive Coverage**: Includes physical, hormonal, nutritional, and lifestyle factors
5. **Embedded Data**: Data is embedded in TypeScript for easier access and faster loading (no CSV parsing needed)

## Implementation Details

### File Structure
- **Scoring Logic**: `components/leaderboard.tsx` (lines 157-242)
- **Data Source**: `components/data.ts`
- **Normalization Function**: `components/leaderboard.tsx` (lines 67-69)
- **Percentile Calculation**: `components/leaderboard.tsx` (lines 72-76)

### Data Flow
1. Data is imported from `data.ts`
2. Data is merged by ID across all datasets
3. Each user's data is normalized and scored
4. Scores are sorted and ranked
5. Percentiles are calculated
6. Leaderboard and charts are rendered

## Current User Data
The system includes sample current user data:
```typescript
export const currentUserData = {
  ID: 11,
  'Total sperm count (x10â¶)': 125,
  'Progressive motility (%)': 15,
  'Serum total testosterone (nmol/L)': 20.5,
  'DNA fragmentation index, DFI (%)': 18,
  'Sperm C22:6,n3 (docosahexaenoic acid, DHA)': 18.9,
  'Age (years)': 35
};
```

## Future Enhancements

The scoring system is designed to be flexible. Potential improvements:
- Dynamic weight adjustment based on research findings
- Additional factors (abstinence time, environmental factors)
- Machine learning-based scoring
- Category-specific sub-scores
- Mapping to PSA 10-point scale or 99 OVR rating for card grading
- Real-time data updates from API
- User-specific scoring customization

## Notes on Data Fields

Some field names contain special characters that may appear differently in different contexts:
- `x10â¶` represents "x10⁶" (million)
- `kg/mÂ²` represents "kg/m²" (kilograms per square meter)
- These encoding issues don't affect the actual scoring calculations

