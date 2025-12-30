# Ideal Subject Score Calculation

**Note:** This calculation uses the optimized weights (Option 1 - Research-Based Optimization) implemented in the scoring system.

## Ideal Values for Each Metric

### Semen Analysis Metrics (Higher = Better)
For metrics where higher is better, ideal values are at or above the maximum normalization range:

1. **Sperm Concentration**: ≥200 (x10⁶/mL) → normalized = 100
2. **Total Sperm Count**: ≥300 (x10⁶) → normalized = 100
3. **Ejaculate Volume**: ≥6 (mL) → normalized = 100
4. **Sperm Vitality**: ≥90 (%) → normalized = 100
5. **Normal Spermatozoa**: ≥15 (%) → normalized = 100
6. **Progressive Motility**: ≥70 (%) → normalized = 100

### DNA Quality Metrics (Lower = Better, Inverted)
For metrics where lower is better, ideal values are at the minimum (0):

7. **DNA Fragmentation Index (DFI)**: 0% → normalize(0, 0, 30) = 0 → inverted = 100
8. **High DNA Stainability (HDS)**: 0% → normalize(0, 0, 30) = 0 → inverted = 100

### Hormone Levels (Optimal Ranges)
9. **Testosterone**: ≥35 (nmol/L) → normalized = 100
10. **FSH**: ≤1 (IU/L) → normalize(1, 1, 12) = 0 → inverted = 100
11. **LH**: ≥9 (IU/L) → normalized = 100
12. **Inhibin B**: ≥300 (ng/L) → normalized = 100

### Fatty Acids (Higher Omega-3s = Better)
13. **Sperm DHA**: ≥30 (%) → normalized = 100
14. **Sperm EPA**: ≥10 (%) → normalized = 100
15. **Serum DHA**: ≥10 (%) → normalized = 100
16. **Serum EPA**: ≥4 (%) → normalized = 100

### Participant Factors (Optimal Ranges)
17. **Age**: Exactly 30 years → |30-30| = 0 → normalize(0, 0, 20) = 0 → inverted = 100
18. **BMI**: Exactly 22 (kg/m²) → |22-22| = 0 → normalize(0, 0, 10) = 0 → inverted = 100

## Score Calculation

With all normalized values at 100, using the optimized weights (Option 1), the calculation is:

```
overall_score = 
  100 × 0.06 +  // Sperm Concentration (6%) - Reduced from 8%
  100 × 0.10 +  // Total Sperm Count (10%) - Increased from 8% (more predictive)
  100 × 0.04 +  // Ejaculate Volume (4%) - Reduced from 6%
  100 × 0.05 +  // Sperm Vitality (5%) - Reduced from 6%
  100 × 0.05 +  // Normal Spermatozoa (5%) - Reduced from 6%
  100 × 0.05 +  // Progressive Motility (5%) - Reduced from 6%
  100 × 0.18 +  // DNA Fragmentation (18%) - Increased from 10% (most important)
  100 × 0.07 +  // HDS (7%) - Increased from 5%
  100 × 0.06 +  // Testosterone (6%) - Increased from 5%
  100 × 0.03 +  // FSH (3%) - Reduced from 5%
  100 × 0.04 +  // LH (4%) - Reduced from 5%
  100 × 0.05 +  // Inhibin B (5%) - Same
  100 × 0.03 +  // Sperm DHA (3%) - Same
  100 × 0.02 +  // Sperm EPA (2%) - Same
  100 × 0.02 +  // Serum DHA (2%) - Reduced from 3%
  100 × 0.01 +  // Serum EPA (1%) - Reduced from 2%
  100 × 0.10 +  // Age (10%) - Same (critical factor)
  100 × 0.04    // BMI (4%) - Reduced from 5%
```

## Result

**Ideal Subject Score = 100.0 points**

Since all weights sum to 1.0 (100%) and all normalized values are at the maximum (100), the ideal subject achieves a perfect score of 100.

## Breakdown by Category (Updated Weights)

- **Semen Analysis (35%)**: 35.0 points (all metrics at 100)
  - Concentration: 6%, Count: 10%, Volume: 4%, Vitality: 5%, Normal: 5%, Motility: 5%
- **DNA Quality (25%)**: 25.0 points (all metrics at 100)
  - DNA Fragmentation: 18%, HDS: 7%
- **Hormones (18%)**: 18.0 points (all metrics at 100)
  - Testosterone: 6%, FSH: 3%, LH: 4%, Inhibin B: 5%
- **Fatty Acids (8%)**: 8.0 points (all metrics at 100)
  - Sperm DHA: 3%, Sperm EPA: 2%, Serum DHA: 2%, Serum EPA: 1%
- **Participant Factors (14%)**: 14.0 points (all metrics at 100)
  - Age: 10%, BMI: 4%
- **Total**: 100.0 points

## Key Changes from Original Weights

The optimized weights (Option 1) emphasize research-backed predictors:
- **DNA Fragmentation**: Increased from 10% → 18% (strongest predictor)
- **Total Sperm Count**: Increased from 8% → 10% (more predictive than concentration)
- **DNA Quality Category**: Increased from 15% → 25% (research shows critical importance)
- **Semen Analysis Category**: Reduced from 40% → 35% (still foundation, but balanced)
- **FSH**: Reduced from 5% → 3% (less directly predictive)
- **Serum Fatty Acids**: Slightly reduced (supporting factors)

## Real-World Context

In practice, achieving a perfect score of 100 is extremely rare or impossible because:
1. Biological systems have natural variability
2. Some metrics may be inversely correlated (e.g., very high testosterone might affect other hormones)
3. Age and BMI are fixed at specific optimal values, but other factors may not align perfectly

### Realistic "Excellent" Score
A more realistic "excellent" score might be in the **85-95 range**, representing:
- Above-average performance across most metrics
- Near-optimal values in key areas (semen analysis, DNA quality)
- Good hormonal balance
- Health lifestyle factors

### Score Interpretation
- **90-100**: Exceptional/Eltie (top 1-5%)
- **80-89**: Excellent (top 10-20%)
- **70-79**: Good (top 25-40%)
- **60-69**: Average (middle 50%)
- **Below 60**: Below Average

## Example Ideal Subject Profile

```
Age: 30 years
BMI: 22.0 kg/m²

Sperm Concentration: ≥200 x10⁶/mL
Total Sperm Count: ≥300 x10⁶
Ejaculate Volume: ≥6.0 mL
Sperm Vitality: ≥90%
Normal Spermatozoa: ≥15%
Progressive Motility: ≥70%

DNA Fragmentation: 0%
HDS: 0%

Testosterone: ≥35 nmol/L
FSH: ≤1 IU/L
LH: ≥9 IU/L
Inhibin B: ≥300 ng/L

Sperm DHA: ≥30%
Sperm EPA: ≥10%
Serum DHA: ≥10%
Serum EPA: ≥4%
```

**Final Score: 100.0 points**

