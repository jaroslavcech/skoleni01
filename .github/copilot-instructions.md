# Project Coding Guidelines

## Stack
- Use React with TypeScript and keep the UI within the existing Vite app structure.
- Prefer functional components and local state for UI-only behavior.

## Code Style
- Use semantic JSX structure and accessible form controls.
- Keep components small, focused, and easy to scan.
- Prefer clear names over abbreviations for state, props, and helpers.
- Preserve the existing CSS variable approach for theming and layout.

## Task Manager Expectations
- Support adding, deleting, and completing tasks without page reloads.
- Validate user input before adding tasks.
- Keep responsive behavior intact for desktop and mobile layouts.

## Quality
- Avoid unused imports, assets, and dead code.
- Keep comments rare and only when a block would otherwise be hard to parse.
- Run build or lint validation after meaningful UI changes when practical.