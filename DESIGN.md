# gnudas-nextjs Design System

## Purpose

gnudas-nextjs is a compact public-sector AI tools workspace. The UI should feel like an internal workbench: dark, dense, direct, and optimized for repeat use.

## Color Tokens

- `--bg0`: `#111318`, app background
- `--bg1`: `#171b23`, secondary dark surface
- `--text-main`: `#eceff4`, primary text
- `--text-sub`: `#aeb5c1`, secondary text
- `--panel`: `rgba(255, 255, 255, 0.04)`, quiet panel fill
- `--panel-border`: `rgba(255, 255, 255, 0.08)`, default divider
- `--line`: `rgba(255, 255, 255, 0.08)`, hairline separators
- Accent cyan: `#75e8ff`, primary tool action

## Typography

- Primary font: `"Noto Sans KR", "Apple SD Gothic Neo", "Segoe UI", sans-serif`
- Monospace labels: `monospace`
- Tool page title: `clamp(2.2rem, 4.2vw, 3.8rem)`, 800 weight
- Section title: 18px, 700 weight
- Body/supporting text: 13-15px, 1.6-1.8 line height

## Layout

- App shell uses a fixed left sidebar on desktop and a slide-out sidebar on mobile.
- Tool pages use `ToolShell` with a single-column content rail and repeated unframed sections.
- Dividers and spacing carry structure. Avoid nested cards and decorative containers.

## Components

- `ToolShell`: standard tool page frame.
- `surface`: section with top border and no card chrome.
- `buttonPrimary`: main action button.
- `buttonSecondary` and `buttonGhost`: secondary commands.
- `splitItem`: compact information row.
- `codeBlock`: command or prompt block.

## Interaction

- Tools should expose the real workflow immediately.
- If a capability cannot run in the browser, state the local execution boundary plainly and provide the exact next action.
