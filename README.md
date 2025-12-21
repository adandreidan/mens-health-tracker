# Men’s Health Analytics Tracker

A full-stack mobile application that transforms anonymized health data into interpretable insights using structured scoring logic, data analysis, and a modern mobile interface. The project emphasizes explainability, modular system design, and real-world data constraints.

---

## Overview

This application analyzes health-related metrics (e.g., blood tests, lifestyle factors, age group comparisons) and presents users with clear, visual insights into how their data compares to broader population trends.

Rather than relying on opaque predictions, the system focuses on **transparent scoring**, **data validation**, and **graceful handling of missing inputs**, reflecting real-world healthcare data challenges.

---

## Architecture & Ownership

This project was designed and implemented end-to-end.

### Frontend
- Built with **Expo (React Native + TypeScript)**
- File-based routing using **Expo Router**
- Modular, reusable UI components
- Data visualizations designed for clarity and interpretability

### Application Logic (Backend-equivalent)
- Scoring, validation, and aggregation logic implemented through structured scripts and utilities
- Custom hooks and shared helpers abstract business logic from UI
- Strong type safety through centralized TypeScript definitions

> The current backend exists as **local data-processing and scoring logic** within the application, designed to be easily externalized into an API as the project scales.

---

## Key Engineering Challenges Solved

- **Interpretable Scoring:** Designed a scoring system that balances statistical relevance with user interpretability
- **Missing Data Handling:** Implemented logic to safely compute results even with incomplete inputs
- **Weight Verification:** Ensured scoring weights are mathematically consistent and verifiable
- **Separation of Concerns:** Clean separation between UI, business logic, and data models
- **Scalable Design:** Structured the project so logic can be migrated to a server-based API without refactoring the frontend
