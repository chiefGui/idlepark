# Modifier System Refactor Plan

## Goal
Replace the current `Effect` system with a PoE-style modifier system that:
- Tracks the SOURCE of every modifier (building, perk, guest)
- Uses proper flat/increased/more stacking
- Makes add/remove operations trivial (filter by source)
- Is easy to debug and visualize

## Current Formula
```
finalRate = (base × multiplier) where multiplier = Π(all multipliers)
```

## New Formula (PoE-style)
```
finalRate = (base + Σflat) × (1 + Σincreased/100) × Πmore
```

Where:
- `flat`: Added per-day value (e.g., +20 entertainment/day)
- `increased`: Percentage bonus, additive with others (e.g., +20% guests)
- `more`: Multiplicative bonus (e.g., ×1.5 money)

---

## Files to Change

### 1. NEW: `src/engine/modifiers.ts`
Create the core modifier system:
- `ModifierSource` type (building, perk, guest, base)
- `Modifier` type with source, stat, flat, increased, more
- `Modifiers.collect(state)` - gather all modifiers from buildings/perks
- `Modifiers.calculate(modifiers, stat)` - compute final rate for a stat
- `Modifiers.getBySource(modifiers, source)` - filter helpers
- `Modifiers.remove(modifiers, source)` - remove by source

### 2. UPDATE: `src/engine/game-types.ts`
- Keep `Effect` type for building/perk definitions (it's fine as config)
- Add `Modifier` and `ModifierSource` exports
- No changes to `GameState` (modifiers are derived, not stored)

### 3. UPDATE: `src/engine/effects.ts`
- Deprecate or remove `aggregate()`
- Keep `applyRates()` and `clampStats()` (still needed)
- Update `getFinalRate()` to work with new system
- Rename to work with modifiers OR keep as thin wrapper

### 4. UPDATE: `src/store/game-store.ts`
- Replace `computeRates()` with `computeModifiers()`
- Store `modifiers: Modifier[]` instead of/alongside `rates`
- Update all actions (buildAtSlot, demolishSlot, purchasePerk, etc.)
- Ensure demolish properly removes building's modifiers

### 5. UPDATE: `src/systems/guest.ts`
- `getEffects()` → `getModifiers()`
- Return modifiers with `source: { type: 'guest' }`

### 6. UPDATE: `src/systems/building.ts`
- Add helper: `getModifiers(buildingId, slotIndex): Modifier[]`
- Converts `effects` array to modifiers with proper source

### 7. UPDATE: `src/systems/perk.ts`
- Add helper: `getModifiers(perkId): Modifier[]`
- Converts `effects` array to modifiers with proper source

### 8. UPDATE: `src/systems/milestone.ts`
- Update `estimateAchievedDay` to use new rate calculation

### 9. UPDATE: `src/components/stats/stat-display.tsx`
- Update to use new modifier system for rate display

### 10. UPDATE: `src/components/analytics/analytics-content.tsx`
- If it uses rates, update accordingly

---

## Implementation Order

1. **Create modifiers.ts** - Core system, no dependencies
2. **Update game-types.ts** - Add types
3. **Update building.ts & perk.ts** - Add getModifiers helpers
4. **Update guest.ts** - Convert to modifiers
5. **Update effects.ts** - Adapt to work with modifiers
6. **Update game-store.ts** - Replace computeRates, this is the critical change
7. **Update milestone.ts** - Fix rate estimation
8. **Update UI components** - stat-display, analytics
9. **Test thoroughly** - Build, demolish, perks, offline progress

---

## Modifier Types Detail

```typescript
type ModifierSource =
  | { type: 'building'; slotIndex: number; buildingId: string }
  | { type: 'perk'; perkId: string }
  | { type: 'guest' }

type Modifier = {
  source: ModifierSource
  stat: StatId
  flat?: number      // +X/day
  increased?: number // +X%
  more?: number      // ×X
}
```

---

## Key Invariants

1. **Modifiers are derived** - Never persisted, always computed from state
2. **Guest modifiers recalculated each tick** - They depend on current guest count
3. **Building modifiers only exist for occupied slots** - Demolish = no modifiers
4. **Perk modifiers only exist for owned perks** - Simple filter

---

## Rollback Plan

If something breaks catastrophically:
- The old Effect system is simple, we can revert
- Keep Effect type for building/perk config (no changes there)
- Only the rate calculation logic changes

---

## Success Criteria

- [ ] Demolishing a building immediately removes its stat contributions
- [ ] Adding a building immediately adds its stat contributions
- [ ] Perks apply correctly
- [ ] Guest dynamics still work (arrival, consumption, income)
- [ ] Offline progress calculates correctly
- [ ] Milestone day estimation still works
- [ ] UI shows correct rates
- [ ] Build passes with no errors
