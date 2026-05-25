# Studio White Redesign

## Overview
Redesign Dexam2 with a clean, airy, editorial-inspired aesthetic. Warm off-white base, near-black text, terracotta accent, paired serif/sans typography.

## Design Tokens

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#F5F5F0` | Page background (warm off-white) |
| `--surface` | `#FFFFFF` | Card/surface backgrounds |
| `--border` | `#ECE8E0` | Borders, dividers, subtle lines |
| `--text-primary` | `#2D3436` | Headings, body text |
| `--text-secondary` | `#8A877E` | Muted text, metadata |
| `--accent` | `#E17055` | Primary accent (terracotta) |
| `--accent-hover` | `#D46045` | Accent hover state |
| `--accent-subtle` | `#FDF6F3` | Accent background tint |
| `--nav-active-bg` | `#2D3436` | Active nav item background |
| `--nav-active-text` | `#FFFFFF` | Active nav item text |
| `--nav-text` | `#6B685F` | Inactive nav item text |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.04)` | Card shadows |
| `--shadow-md` | `0 2px 12px rgba(0,0,0,0.04)` | Elevated shadows |

### Typography
| Role | Font | Weight |
|------|------|--------|
| Headings (h1-h3) | DM Serif Display | 400 |
| Body UI | DM Sans | 400/500/600 |
| Small/meta | DM Sans | 400 |

### Spacing
- Page padding: `p-8 lg:p-10`
- Card padding: `p-6` (was `p-4`/`p-5`)
- Card gap: `gap-4` between icon and text
- Section spacing: `mb-8` between groups
- Border radius: `rounded-xl` (12px) for cards, `rounded-lg` (8px) for buttons/inputs

## Files to Modify

### `src/app/globals.css`
- Add `@theme` block with all color tokens
- Add `@layer base` with semantic color variables
- Add base body styles (bg, text color)

### `src/app/layout.tsx`
- Replace `Inter` with `DM_Sans` (body) and `DM_Serif_Display` (headings)
- Update body className: bg off-white

### `src/app/client-layout.tsx`
- Update sidebar/main spacing: sidebar `w-56` → `w-52`, main padding `p-6 lg:p-8` → `p-8 lg:p-10`

### `src/components/layout/Sidebar.tsx`
- Replace blue active state with near-black (#2D3436)
- Replace gray-50 hover with softer stone hover
- Update icon colors
- Remove border-right or make it border-[#ECE8E0]
- Update brand text

### `src/app/page.tsx`
- Exam cards: updated border, shadow, padding, radius
- Progress bar: terracotta accent instead of blue
- Icon container: subtle surface border instead of blue
- Chevron: softer stone color

### `src/app/exam/[examId]/page.tsx`
- Section cards: updated styling matching home cards
- Back link: updated muted text color
- Score badge: terracotta accent
- Group headers: updated tracking and color

### `src/app/exam/[examId]/[sectionKey]/page.tsx`
- Exercise container: surface card with updated styling
- Section header with uppercase label and question count
- All exercise components to use new palette

### `src/app/vocab/page.tsx`
- Search input: updated border/focus ring (terracotta instead of blue)
- Filter pills: inactive = border only, active = terracotta bg
- Word rows: updated card styling
- Remove button: hover red
- Flashcard: updated border and accent colors

### `src/app/notes/page.tsx`
- Note cards: updated styling matching design
- Delete button: hover terracotta

### Exercise Components (all in `src/components/exercises/`)
- Radio/checkbox styles: terracotta accent, larger touch targets
- Button styles: terracotta primary, subtle secondary
- Text inputs: updated border/focus rings
- Gap fill banks: updated token styling

### `src/components/ui/AudioPlayer.tsx`
- Dark bar: near-black (#2D3436) background
- Progress: terracotta accent
- Clean spacing

### `src/components/dictionary/DictionaryDrawer.tsx`
- Updated surface and border colors
- Save button: terracotta accent
- Close button: updated

### `src/components/dictionary/ClickableWord.tsx`
- Updated highlight color (terracotta tint)

## Component Details

### Sidebar
```
w-52 (shrink-0)
bg-[#FFFFFF] with border-r border-[#ECE8E0]
Brand: flex items-center gap-2 px-3 py-4
Nav items: px-3 py-2 rounded-lg text-sm
  - Active: bg-[#2D3436] text-white
  - Inactive: text-[#6B685F] hover:bg-[#F5F5F0]
Icons: 18px, stroke-width 1.5
```

### Exam Cards
```
bg-white border border-[#ECE8E0] rounded-xl p-6
hover:shadow transition-all
Icon container: 44px, rounded-[10px], border, bg-[#F5F5F0]
Typography: font-semibold text-[15px] for title
Description: text-[13px] text-[#8A877E]
Progress bar: 5px height, bg-[#ECE8E0], accent fill
```

### Exercise Components
```
Question stem: text-[15px] leading-relaxed
Choice items: p-[14px_16px] border-[1.5px] rounded-[10px]
  - Selected: border-[#E17055] bg-[#FDF6F3]
  - Unselected: border-[#ECE8E0]
Radio circle: 20px, border-2, inner dot on selected
```

### Audio Player
```
bg-[#2D3436] rounded-xl p-[16px_24px]
Progress track: 4px bg-white/15
Progress fill: bg-[#E17055] rounded-full
Timeline text: text-white/60 text-[12px]
Play button: 32px circle, white/10 bg
```

## Out of Scope
- No structural layout changes (sidebar + main stays)
- No animation additions
- No new pages or components
