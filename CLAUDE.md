# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tabra is an Algerian healthcare platform landing page built with React and Vite. It features an AI symptom checker, doctor/clinic directory with map view, appointment booking, and digital health cards.

## Commands

```bash
npm run dev      # Start development server (Vite HMR)
npm run build    # Build for production (outputs to dist/)
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

## Architecture

Single-page React application with minimal structure:

- `src/App.jsx` - Main component containing all sections (header, hero, features, services, CTA, footer), plus `translations` object for all UI text
- `src/App.css` - Component styles using CSS custom properties
- `src/index.css` - Global styles, fonts (Instrument Serif, Outfit, Cairo for Arabic), CSS variables
- `public/logo.png` - Brand logo used in header/footer

**Bilingual Support**: The app supports Arabic (RTL) and English (LTR) with language toggle. All translatable text is in the `translations` object at the top of App.jsx with `ar` and `en` keys. RTL styles are in App.css under `.rtl` class.

**Animation Pattern**: Uses Framer Motion with reusable variants (`fadeInUp`, `staggerContainer`) for scroll-triggered animations via `whileInView`.

## Key Technologies

- **React 19** with Vite 7
- **Framer Motion** for scroll-triggered animations and transitions
- **CSS Custom Properties** for theming (--red: #DC2626, white-space focused design)

## Design Constraints

- No icons in UI (per project requirements)
- Red (#DC2626) primary color with generous white space
- Instrument Serif for headings, Outfit for body text
