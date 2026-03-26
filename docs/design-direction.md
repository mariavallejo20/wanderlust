# Wanderlust — Design Direction

## Visual Philosophy

**"Clean Travel"** — Inspired by Notion (clean, spacious, functional) and Airbnb (visual, warm, inspiring). The interface doesn't compete with the content — it frames it.

Light background, generous whitespace, large imagery that inspires travel, clear typography hierarchy.

## Color Palette

### Primary — Deep Cyan

| Token                   | Hex       | Usage                                     |
| ----------------------- | --------- | ----------------------------------------- |
| `--color-primary`       | `#0891B2` | CTAs, header, active elements, links      |
| `--color-primary-light` | `#ECFEFF` | Badges, subtle backgrounds, hover states  |
| `--color-primary-hover` | `#0E7490` | Hover/pressed states for primary elements |

### Secondary & Accents

| Token                 | Hex       | Usage                                          |
| --------------------- | --------- | ---------------------------------------------- |
| `--color-secondary`   | `#1A1A2E` | Headings, primary text — dark navy             |
| `--color-accent-warm` | `#FF6B35` | Alerts, price highlights, "in progress" badges |
| `--color-accent-blue` | `#2196F3` | Informational elements, map icons              |

### Activity Category Colors

| Category      | Color          | Hex       |
| ------------- | -------------- | --------- |
| Transport     | Blue           | `#2196F3` |
| Accommodation | Purple         | `#7C3AED` |
| Food          | Orange         | `#FF6B35` |
| Culture       | Teal (primary) | `#0891B2` |
| Leisure       | Pink           | `#EC4899` |
| Shopping      | Amber          | `#F59E0B` |
| Nature        | Green          | `#10B981` |
| Nightlife     | Indigo         | `#6366F1` |
| Other         | Gray           | `#6B7280` |

## Typography

- **Montserrat 700** — Page titles, trip names (32px)
- **Montserrat 600** — Section headings, labels (24px)
- **Montserrat 400** — Body text, descriptions (16px)
- **Montserrat 400** — Secondary text, captions (14px)

## Spacing & Shape

- **Border radius**: 8px default, 12px cards, 4px small elements
- **Padding**: 24px containers, 16px between elements
- **Shadows**: subtle by default, more pronounced on hover

## Key UI Patterns

### Dashboard

- Grid of trip cards (2-3 columns on desktop, 1 on mobile)
- Each card: large cover image (16:9) with gradient overlay, title and destination on the image in white
- Below image: dates, status badge, activity count, estimated budget
- Hover: stronger shadow + slight scale up
- Tabs: "Upcoming", "Drafts", "Past"
- Empty state: SVG illustration + CTA button

### Trip Detail

- Two-column layout on desktop: timeline (60%) + sticky map (40%)
- Wide cover image header with overlaid trip info (title, dates, destination, total budget)
- Mobile: single column, map as separate tab

### Activity Timeline

- Each day is an expandable section: "Day 1 — April 15 · Arrival in Rome"
- Activities as horizontal cards: category icon (colored), name, time, location, cost
- Category colors consistent throughout the app
- Drag & drop to reorder

### Budget View

- Donut chart by category + horizontal bars by day
- Category colors consistent with activity icons

## Responsive Breakpoints

- **Desktop** (≥1024px): card grid, two-column trip detail
- **Tablet** (≥768px): 2-column grid, map below timeline
- **Mobile** (<768px): single column, map as tab
