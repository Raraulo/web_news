<p align="center">
  <img src="https://cdn.simpleicons.org/nextdotjs/white" width="90" alt="Next.js Logo">
</p>


<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Framer_Motion-Animation-0055FF?logo=framer" alt="Framer Motion">
  <img src="https://img.shields.io/badge/Anime.js-JavaScript-FF6B6B" alt="Anime.js">
  <img src="https://img.shields.io/badge/Recharts-Charts-8884D8" alt="Recharts">
  <img src="https://img.shields.io/badge/Vercel-Deployment-black?logo=vercel" alt="Vercel">
</p>



---

# Overview

The Quito Grid is a modern digital newspaper built with **Next.js**. The application aggregates news from external sources and presents them through an editorial interface inspired by professional online newspapers. In addition to news articles, it integrates weather forecasts, financial market information, sports events, multimedia content and a fully responsive user experience.

---


## Table of Contents

- Overview
- Features
- Technology Stack
- Project Structure
- Installation
- Environment Variables
- Development
- Deployment
- Project Status
- Author

---

# Overview

The Quito Grid is a modern digital newspaper built with **Next.js**. The application aggregates news from external sources and presents them through an editorial interface inspired by professional online newspapers. In addition to news articles, it integrates weather forecasts, financial market information, sports events, multimedia content and a fully responsive user experience.

---

# Features

## News

- Editorial-style homepage
- Dynamic news categories
- Featured headlines
- News cards with images, source and publication date

### Categories

- Technology
- Sports
- Business
- Health
- Science
- Entertainment
- Fashion
- Food

## Weather

- Current weather conditions
- Hourly forecast
- Quito weather integration

## Sports

- Live sports section
- Daily fixtures
- Match information

## Multimedia

- YouTube video integration
- Music recommendations
- Audio previews

## Financial Markets

- Interactive stock charts
- Technology companies
- Market overview

## User Experience

- Responsive design
- Dark and Light themes
- Smooth page transitions
- Modern animations

---

# Technology Stack

| Category | Technology |
|-----------|------------|
| Framework | Next.js 16 |
| UI Library | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion |
| JavaScript Animations | Anime.js |
| Charts | Recharts |
| Icons | Lucide React |
| Theme Management | next-themes |
| Deployment | Vercel |

---

# Project Structure

```text
src/
├── app/
│   ├── api/
│   ├── [category]/
│   └── page.tsx
│
├── components/
│   ├── layout/
│   └── ui/
│
└── lib/
    └── api.ts
```

---

# Installation

Clone the repository.

```bash
git clone <repository-url>
cd news
```

Install dependencies.

```bash
npm install
```

---

# Environment Variables

The project consumes external APIs to retrieve news, weather and financial market information.

Create a `.env.local` file in the project root and configure the required environment variables.

```env
NEWS_API_KEY=

STOCKS_API_KEY=
```

Sensitive credentials should never be committed to the repository.

---

# Development

Run the development server.

```bash
npm run dev
```

Open your browser at:

```text
http://localhost:3000
```

Useful commands:

```bash
npm run lint
```

```bash
npm run build
```

```bash
npm run start
```

---

# Deployment

The project is optimized for deployment on **Vercel**, providing native support for Next.js applications, API Routes and automatic deployments.

General deployment process:

```bash
npm install
npm run build
```

Configure the required environment variables in your hosting provider before publishing the application.

---

# Project Status

The application is actively maintained and designed as a modern news platform with support for multimedia content, financial information and responsive user experiences.

Future improvements may include:

- Advanced search
- Article bookmarking
- User authentication
- Personalized news feed
- SEO optimization
- Content management dashboard

---

# Author

Modern news platform developed with **Next.js**, **React** and **TypeScript**, focused on delivering an engaging digital newspaper experience.
