# Missing Data Handling - Current Status & Solution

## Current Problem

**Issue:** The system currently defaults missing parameters to `0`, which causes unfair scoring penalties:

```typescript
// Current code (problematic):
sperm_concentration: semenItem['Sperm concentration (x10â¶/mL)'] || 0,
testosterone: hormoneItem['Serum total testosterone (nmol/L)'] || 0,
age: participantItem['Age (years)'] || 0,
```

### Problems:
1. **Can't distinguish** between missing data and actual 0 values
2. **Unfair penalties** - missing data gets worst-possible scores
3. **Invalid normalizations** - 0 values outside normal ranges produce negative/incorrect normalized scores
4. **No transparency** - users don't know which data is missing

## Recommended Solution

### Step 1: Detect Missing Values Properly

Replace `|| 0` pattern with explicit null checking:

```typescript
// Helper function (already added to file)
const isValueMissing = (value: any): boolean => {
  return value === null || value === undefined || value === '' || 
         (typeof value === 'number' && isNaN(value));
};

// Use in data extraction:
const getValue = (item: any, key: string): { value: number | null; isMissing: boolean } => {
  if (!item) return { value: null, isMissing: true };
  const val = item[key];
  if (isValueMissing(val)) {
    return { value: null, isMissing: true };
  }
  const numVal = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(numVal)) {
    return { value: null, isMissing: true };
  }
  return { value: numVal, isMissing: false };
};
```

### Step 2: Track Available Parameters

Store availability flags for each parameter:

```typescript
_available: {
  sperm_concentration: boolean,
  total_sperm_count: boolean,
  // ... etc
}
```

### Step 3: Adjust Weights for Missing Data

Use the `adjustWeightsForMissingData` function (already added) to:
- Redistribute weights proportionally within categories
- Set missing parameter weights to 0
- Maintain category balance

### Step 4: Handle Null Values in Normalization

Update normalization to skip missing values:

```typescript
// Only normalize if value is not null
const normalizedConcentration = user.sperm_concentration !== null 
  ? normalizeValue(user.sperm_concentration, 0, 200)
  : 0; // Will be multiplied by 0 weight anyway
```

### Step 5: Calculate Data Completeness

Track how much data is available:

```typescript
const dataCompleteness = calculateDataCompleteness(availableParams, 18); // 18 total parameters
// Returns 0-100% indicating data quality
```

## Implementation Checklist

- [x] Add `isValueMissing` helper function
- [x] Add `adjustWeightsForMissingData` function  
- [x] Add `calculateDataCompleteness` function
- [ ] Update data merging to use `getValue` helper
- [ ] Update normalization to handle null values
- [ ] Update scoring to use adjusted weights
- [ ] Add data completeness tracking to user data
- [ ] Update UI to display data completeness

## Impact on Scoring

### Before (Current):
- Missing testosterone → defaults to 0 → normalized to negative/0 → loses 6% of score unfairly
- Missing age → defaults to 0 → |0-30| = 30 → normalized to 0 → loses 10% of score unfairly

### After (With Solution):
- Missing testosterone → weight redistributed to other hormones → fair scoring
- Missing age → weight added to BMI or marked as incomplete → fair scoring
- Data completeness shown → users know score reliability

## Minimum Data Requirements

**Critical Parameters (Required for valid score):**
- At least 3 of 6 semen analysis parameters
- DNA fragmentation (most important)
- Age (for context)

**Optional Parameters:**
- Hormone measurements (can be partially missing)
- Fatty acid data (can be completely missing)
- BMI (nice to have, not critical)

## Example: Subject with Missing Hormone Data

**Scenario:** Subject has all semen analysis and DNA data, but missing all hormone data.

**Current System:**
- Loses 18% of possible score (all hormone weights)
- Final score: Maximum 82/100 even if perfect otherwise

**With Solution:**
- Hormone weights (18%) redistributed to other categories
- Semen analysis: 35% → ~43% (proportional increase)
- DNA quality: 25% → ~30% (proportional increase)
- Fair scoring based on available data
- Data completeness: ~78% (14/18 parameters)

## Next Steps

1. **Implement data extraction with missing value detection**
2. **Update scoring calculation to use adjusted weights**
3. **Add data completeness to UI**
4. **Add validation for minimum required parameters**
5. **Test with subjects having various missing data patterns**

## Code Location

- Helper functions: `components/leaderboard.tsx` (lines 71-123)
- Data merging: `components/leaderboard.tsx` (lines 170-208) - **NEEDS UPDATE**
- Scoring calculation: `components/leaderboard.tsx` (lines 210-278) - **NEEDS UPDATE**

