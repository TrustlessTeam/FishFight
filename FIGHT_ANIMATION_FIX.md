# Fighting Animation Fix - Unity Integration

## Problem
When onchain fight actions complete, Unity fighting animations were not displaying properly. The UI elements weren't updating to reflect fight results.

## Root Cause
1. The `sendFightResult` function was sending all round statistics simultaneously without delays, preventing Unity from properly animating through each round before showing results.
2. **CRITICAL BUG**: The frontend uses `"ShowFightResultsSuccess"` but Unity's `CanvasController` expects `"ShowFightingResults"` (note: "Fighting" not "Fight", and no "Success" suffix). This mismatch prevents the results UI from displaying.

## Solution
Update `sendFightResult` in `src/context/unityContext.tsx` to send rounds sequentially with delays, ensuring Unity has time to process and animate each round.

---

## Required Changes

### File: `src/context/unityContext.tsx`

**Replace the `sendFightResult` function (around line 345-381) with:**

```typescript
const sendFightResult = (fight: Fight, fish1: Fish, fish2: Fish) => {
  // console.log("SendFight Called");
  if (!isLoaded || !fishPoolReady) return;
  console.log(fight)
  
  // Ensure fighting UI is visible before sending rounds/results
  showFightingUI();
  
  // Send round stats sequentially with delays to allow Unity to animate each round
  // Unity needs time to process and display each round animation
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
    // CRITICAL: Unity expects "ShowFightingResults" not "ShowFightResultsSuccess"
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFightingResults");
    
    setTimeout(() => {
      UnityInstance.send("CanvasUserInterface", "FightingResultsUI_SetFish1", JSON.stringify(fish1) ); 
      UnityInstance.send("CanvasUserInterface", "FightingResultsUI_SetFish2", JSON.stringify(fish2) ); 
    }, 100);
  }, 1500);
};
```

---

## Unity Method Call Sequence

### Expected Flow for Fight Results:

1. **Show Fighting UI** (immediate)
   - `CanvasUserInterface.SetAnimState("ShowFighting")`
   - Ensures UI is visible before sending data

2. **Send Round 1 Stat** (immediate)
   - `FishPool.SetRound1Stat(round1Value)`
   - Value: 0=Strength, 1=Intelligence, 2=Agility

3. **Send Round 2 Stat** (after 500ms delay)
   - `FishPool.SetRound2Stat(round2Value)`

4. **Send Round 3 Stat** (after 1000ms delay)
   - `FishPool.SetRound3Stat(round3Value)`

5. **Send Fight Results** (after 1500ms delay)
   - `FishPool.SetFightResults(JSON.stringify(fight))`
   - Contains: winner, playerResult, typeOfFight, etc.

6. **Show Results UI** (immediate after step 5)
   - `CanvasUserInterface.SetAnimState("ShowFightingResults")` ⚠️ Note: "ShowFightingResults" not "ShowFightResultsSuccess"

7. **Set Fish Data in Results UI** (after 100ms delay from step 6)
   - `CanvasUserInterface.FightingResultsUI_SetFish1(JSON.stringify(fish1))`
   - `CanvasUserInterface.FightingResultsUI_SetFish2(JSON.stringify(fish2))`

---

## Unity Event Listeners

Unity sends these events back to the frontend:

- `FishPoolFightRound1` - Confirms Round 1 was processed
- `FishPoolFightRound2` - Confirms Round 2 was processed  
- `FishPoolFightRound3` - Confirms Round 3 was processed
- `FishPoolFightWinner` - Confirms winner was determined
- `FishPoolFightTie` - Confirms tie was determined

These are already set up in the `useEffect` hook (lines 147-160).

---

## Key Unity Methods Used

### FishPool GameObject Methods:
- `SetRound1Stat(number)` - Sets round 1 stat (0-2)
- `SetRound2Stat(number)` - Sets round 2 stat (0-2)
- `SetRound3Stat(number)` - Sets round 3 stat (0-2)
- `SetFightResults(string)` - Sets complete fight result JSON
- `SetTie()` - Sets fight as a tie
- `StartFight()` - Starts fight animation (optional, may auto-start)
- `BeginFight()` - Alternative start method
- `SetFightState(string)` - Sets fight state

### CanvasUserInterface GameObject Methods:
- `SetAnimState("ShowFighting")` - Shows fighting UI
- `SetAnimState("ShowFightingResults")` - Shows results UI ⚠️ CRITICAL: Must be "ShowFightingResults" not "ShowFightResultsSuccess"
- `FightingUI_SetFish1(string)` - Sets fish 1 in fighting UI (JSON)
- `FightingUI_SetFish2(string)` - Sets fish 2 in fighting UI (JSON)
- `FightingResultsUI_SetFish1(string)` - Sets fish 1 in results UI (JSON)
- `FightingResultsUI_SetFish2(string)` - Sets fish 2 in results UI (JSON)

---

## Timing Notes

- **500ms delay** between rounds allows Unity to animate each round
- **1500ms total delay** before results ensures all 3 rounds are processed
- **100ms delay** before setting fish data in results UI allows UI to initialize

If animations feel too fast/slow, adjust these delays:
- Round delays: Currently 500ms (can be 300-1000ms)
- Results delay: Currently 1500ms (can be 1000-2000ms)
- Fish data delay: Currently 100ms (can be 50-200ms)

---

## Testing

After applying the fix:

1. Trigger an onchain fight action
2. Watch browser console for Unity events:
   - `FishPoolFightRound1`
   - `FishPoolFightRound2`
   - `FishPoolFightRound3`
   - `FishPoolFightWinner` or `FishPoolFightTie`
3. Verify Unity animates through each round before showing results
4. Verify UI elements update with correct fish data

---

## Additional Context

The `startFight()` function (lines 504-519) is available for manual fight triggering but may not be needed if Unity auto-starts after rounds are set. The sequential round sending with delays is the critical fix.
