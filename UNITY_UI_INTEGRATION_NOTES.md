# Unity UI Integration Notes - CanvasController & Fighting Animation

## Overview
This document explains how Unity's `CanvasController` handles UI state changes, particularly for fighting animations and results display.

---

## CanvasController.cs Key Information

### Location
`FishFight-Unity/unity_project/Assets/_TrustlessTeam/Scripts/Controllers/CanvasController.cs`

### Important Animator State Names

The `CanvasController` uses these animator trigger names:

```csharp
public static string showFightingUIName = "ShowFighting";
public static string showFightingUIResultsName = "ShowFightingResults";
public static string showBreedingUIName = "ShowBreeding";
public static string showBreedingUIResultsSuccessName = "ShowBreedingResultsSuccess";
public static string showFishingUIName = "ShowFishing";
public static string showFishingUIResultsSuccessName = "ShowFishingResultsSuccess";
public static string showFishUIName = "ShowFish";
public static string hideCanvasUIName = "Hide";
```

### Critical: State Change Detection

The `SetAnimState` method **only triggers animations if the state changed**:

```csharp
public void SetAnimState(string animState)
{
    if (lastAnimState != animState)  // <-- Only triggers if different!
    {
        SetupCurrentAnimState(animState);
    }
    lastAnimState = animState;
}
```

**Implication**: If you call `SetAnimState("ShowFighting")` twice in a row, the second call will be ignored. This is important for ensuring UI state changes are properly applied.

---

## Frontend → Unity State Mapping

### Fighting UI States

| Frontend Call | Unity State Value | Animator Trigger | Purpose |
|--------------|-------------------|------------------|---------|
| `SetAnimState("ShowFighting")` | `CameraController.ShowFightingValue` | `"ShowFighting"` | Shows fighting UI (fish selection, round display) |
| `SetAnimState("ShowFightingResults")` | `CameraController.ShowFightingResultsValue` | `"ShowFightingResults"` | Shows fight results screen |

**⚠️ IMPORTANT**: The frontend code currently uses `"ShowFightResultsSuccess"` but Unity expects `"ShowFightingResults"` (note: "Fighting" not "Fight", and no "Success" suffix).

### Other UI States

| Frontend Call | Unity State Value | Animator Trigger |
|--------------|-------------------|------------------|
| `SetAnimState("ShowBreeding")` | `CameraController.ShowBreedingValue` | `"ShowBreeding"` |
| `SetAnimState("ShowBreedingResultsSuccess")` | `CameraController.ShowBreedingResultsSuccessValue` | `"ShowBreedingResultsSuccess"` |
| `SetAnimState("ShowFishing")` | `CameraController.ShowFishingValue` | `"ShowFishing"` |
| `SetAnimState("ShowFishingResultsSuccess")` | `CameraController.ShowFishingResultsSuccessValue` | `"ShowFishingResultsSuccess"` |
| `SetAnimState("ShowFish")` | `CameraController.ShowFishValue` | `"ShowFish"` |
| `SetAnimState("Hide")` | `hideCanvasUIName` | `"Hide"` |

---

## Fighting Animation Flow

### Correct Sequence for Fight Results

1. **Ensure Fighting UI is Visible**
   ```typescript
   UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFighting");
   ```
   - This ensures the fighting UI is active before sending round data
   - Unity will only trigger if state changed (won't re-trigger if already showing)

2. **Send Round Statistics Sequentially**
   ```typescript
   // Round 1 (immediate)
   UnityInstance.send("FishPool", "SetRound1Stat", fight.round1.value);
   
   // Round 2 (after 500ms delay)
   setTimeout(() => {
     UnityInstance.send("FishPool", "SetRound2Stat", fight.round2.value);
   }, 500);
   
   // Round 3 (after 1000ms delay)
   setTimeout(() => {
     UnityInstance.send("FishPool", "SetRound3Stat", fight.round3.value);
   }, 1000);
   ```

3. **Show Results UI (after 1500ms delay)**
   ```typescript
   setTimeout(() => {
     UnityInstance.send("FishPool", "SetFightResults", JSON.stringify(fight));
     UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFightingResults"); // Note: "ShowFightingResults" not "ShowFightResultsSuccess"
   }, 1500);
   ```

4. **Set Fish Data in Results UI (after 100ms delay from step 3)**
   ```typescript
   setTimeout(() => {
     UnityInstance.send("CanvasUserInterface", "FightingResultsUI_SetFish1", JSON.stringify(fish1));
     UnityInstance.send("CanvasUserInterface", "FightingResultsUI_SetFish2", JSON.stringify(fish2));
   }, 100);
   ```

---

## Critical Fix Needed in Frontend

### Current Frontend Code (INCORRECT):
```typescript
UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFightResultsSuccess");
```

### Should Be (CORRECT):
```typescript
UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFightingResults");
```

**Reason**: Unity's `CanvasController` checks for `CameraController.ShowFightingResultsValue`, which maps to the `"ShowFightingResults"` animator trigger, not `"ShowFightResultsSuccess"`.

---

## State Change Behavior

### Why State Change Detection Matters

Unity's `SetAnimState` method tracks the last state and only triggers animations when the state actually changes. This means:

- ✅ **Good**: `SetAnimState("ShowFighting")` → `SetAnimState("ShowFightingResults")` (different states, both trigger)
- ❌ **Ignored**: `SetAnimState("ShowFighting")` → `SetAnimState("ShowFighting")` (same state, second call ignored)

**Best Practice**: Always ensure you're transitioning to a different state, or explicitly hide/show UI if you need to reset.

---

## Unity Event Callbacks

Unity sends these events back to the frontend (set up in `unityContext.tsx`):

- `FishPoolFightRound1` - Round 1 processed
- `FishPoolFightRound2` - Round 2 processed
- `FishPoolFightRound3` - Round 3 processed
- `FishPoolFightWinner` - Winner determined
- `FishPoolFightTie` - Tie determined

These can be used to verify Unity has processed each step, but the sequential delays in the frontend should handle timing.

---

## Complete Fixed `sendFightResult` Function

```typescript
const sendFightResult = (fight: Fight, fish1: Fish, fish2: Fish) => {
  if (!isLoaded || !fishPoolReady) return;
  console.log(fight)
  
  // Ensure fighting UI is visible before sending rounds/results
  showFightingUI(); // This calls SetAnimState("ShowFighting")
  
  // Send round stats sequentially with delays to allow Unity to animate each round
  if (fight.round1) {
    UnityInstance.send("FishPool", "SetRound1Stat", fight.round1.value);
  }
  
  setTimeout(() => {
    if (fight.round2) {
      UnityInstance.send("FishPool", "SetRound2Stat", fight.round2.value);
    }
  }, 500);
  
  setTimeout(() => {
    if (fight.round3) {
      UnityInstance.send("FishPool", "SetRound3Stat", fight.round3.value);
    }
  }, 1000);
  
  // Wait for all rounds to be processed before showing results
  setTimeout(() => {
    UnityInstance.send("FishPool", "SetFightResults", JSON.stringify(fight));
    // FIX: Use "ShowFightingResults" not "ShowFightResultsSuccess"
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFightingResults");
    
    setTimeout(() => {
      UnityInstance.send("CanvasUserInterface", "FightingResultsUI_SetFish1", JSON.stringify(fish1)); 
      UnityInstance.send("CanvasUserInterface", "FightingResultsUI_SetFish2", JSON.stringify(fish2)); 
    }, 100);
  }, 1500);
};
```

---

## Additional Notes

1. **State Names Must Match Exactly**: Unity uses string comparison (`string.Compare`) to match states, so capitalization and spelling must be exact.

2. **Animator Triggers**: The `CanvasController` uses Unity's Animator system with triggers. Each state change triggers an animation transition.

3. **UI Initialization**: The `CanvasController` calls `CanvasUIStartConfirm()` on start, which the frontend listens for via `CanvasUIStartConfirm` event.

4. **Escape Key Handling**: There's commented-out code for handling Escape key to navigate back through UI states, suggesting Unity expects certain UI flow patterns.

5. **State Persistence**: The `lastAnimState` variable persists the current state, so Unity knows when a state change occurs.

---

## Testing Checklist

After applying fixes:

- [ ] Verify `SetAnimState("ShowFightingResults")` is used (not "ShowFightResultsSuccess")
- [ ] Verify fighting UI shows before sending rounds
- [ ] Verify rounds are sent sequentially with delays
- [ ] Verify results UI appears after all rounds complete
- [ ] Verify fish data appears in results UI
- [ ] Check browser console for Unity events (FishPoolFightRound1/2/3, FishPoolFightWinner/Tie)
