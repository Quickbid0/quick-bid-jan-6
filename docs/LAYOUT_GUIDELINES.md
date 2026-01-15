# Layout, Spacing & Typography Guidelines

## Design Tokens (Source of Truth)
- `spacing` (src/design-system/tokens/spacing.ts) defines the approved rhythm: **2, 4, 6, 8, 12, 16, 20, 24, 32, 40**. Use these values (or multiples thereof) instead of arbitrary `px` values in margin/padding/gap.
- `typography` (src/design-system/tokens/typography.ts) defines the hierarchy:
  - `title` (28px, 600) for pilot page titles
  - `h1` (24px, 600) for section headers
  - `h2` (20px, 600) for subsection titles
  - `body` (16px, 400) for standard copy
  - `caption` (14px, 400) for helper/meta text

### Enforcement Guidance
1. **Tailwind usage:** Prefer utility classes like `p-6`, `gap-4`, `text-base` that match the token values; avoid custom pixel math (e.g., `px-7`). When a new spacing combination is required, check the token list and add a semantic alias in a shared component or `PageFrame` wrapper.
2. **Component alignment:** Use `PageFrame` for page-level structure so the gutters/sizing stay centralized and responsive. Nested grids should align to multiples of the same 8px scale.
3. **Linting (proposed):**
   - Enable `@typescript-eslint/no-magic-numbers` with exceptions for the spacing scale so contributors must name new spacing constants.
   - Use `eslint-plugin-tailwindcss` (if not already active) with `classNamesOrder: true` to prevent ad-hoc Tailwind classes.
   - Add a custom ESLint comment (`// TODO: align to spacing scale`) whenever a temporary value is necessary, so it can be tracked.

## Page Styling Conventions
- Every page should wrap the content in `PageFrame` to normalize gutters, max-widths (`max-w-6xl`), and text hierarchy. The `contentClassName` should be `space-y-{16|24}` (using the spacing tokens).
- Section cards should reuse `rounded-3xl`, `shadow-lg`, and the 8px spacing scale for padding/gaps. Group button actions in flex containers with `gap-3` or `gap-4`.
- Typography should respect the hierarchy: use `text-3xl` for hero headings, `text-xl`/`text-lg` for section headers, `text-base` for body, and `text-sm`/`text-xs` for captions with `text-gray-500` for helper text.

## Rollout Strategy
1. **Phase 1 – Token Adoption & PageFrame:** Ensure `PageFrame` and the spacing tokens exist (done) and that developers know to import them.
2. **Phase 2 – High-Impact Pages:** Align `Products`, `ProductDetail`, and `ProfilePage` to this system (next work item). Use the filters, cards, and CTA alignments described above.
3. **Phase 3 – Cross-Page Cleanup:** Sweep remaining pages by:
   - Replacing ad-hoc `px` values with token-based `className`s.
   - Ensuring section spacing uses multiples of 8.
   - Normalizing button/card border radii/shadows.
4. **Phase 4 – Automation & Linting:** Introduce lint rules/scripts (e.g., in `.eslintrc.cjs` or CI) that fail when `px` values fall outside the approved scale or when `PageFrame` is not used for page shells.

Document this file in the `README` or team onboarding so the guidelines are visible.
