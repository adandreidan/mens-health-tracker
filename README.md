# ManaHealth
### Men's health shouldn't be this hard to engage with.

ManaHealth turns your real biometric data into a personalized health card 
you can actually show off. Testosterone, resting heart rate, VO2 max and 
more, displayed like game attributes and compared against healthy baselines 
and your friends. Built because men don't go to the doctor. This makes that 
a little easier.

---

## What It Does
- Pulls real biometric data from health APIs including testosterone, 
  resting heart rate, and VO2 max
- Encodes each biomarker as a dimension in a vector embedding and computes 
  similarity against healthy baselines to generate your personalized health card
- Friend group leaderboard to compare composite health scores
- Trend visualization using line graphs to track your stats over time
- Handles messy, incomplete real-world health data gracefully

---

## Stack
- **Frontend:** React Native, TypeScript, Expo
- **Backend:** Node.js, MongoDB
- **Data:** Multiple health APIs, vector embeddings, composite scoring algorithm
- **Testing:** Xcode iOS Simulator

---

## Architecture
- Node.js backend handles authentication, API orchestration, and data persistence
- MongoDB stores user profiles, health records, and generated cards
- Scoring algorithm normalizes inputs across 20+ real patient datasets, 
  producing accurate scores regardless of missing data
- Card generation runs in real time, every card is unique and dynamically 
  generated from live user data

---

## Why We Built It
Men are raised to ignore their health. ManaHealth makes engaging with it 
feel less like a doctors visit and more like a game worth playing.
