import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import {
  BaseContainer,
  BaseText,
  BaseTitle,
  BaseButtonStyle,
  UIContainer,
} from "./BaseStyles";
import { useUnity } from "../context/unityContext";
import { useFishPool } from "../context/fishPoolContext";
import { Fish } from "../utils/fish";
import { Fight } from "../utils/fight";

type PuppetCommand = {
  functionName: string;
  sends: string[];
  notes?: string;
};

const defaultFightPayload = JSON.stringify(
  {
    typeOfFight: 0,
    fishChallenger: 0,
    fishOpponent: 0,
    timeOfFight: Math.floor(Date.now() / 1000),
    round1: { value: 0, description: "Strength" },
    round2: { value: 1, description: "Intelligence" },
    round3: { value: 2, description: "Agility" },
    winner: 0,
    playerResult: 0,
  },
  null,
  2
);

const commandReference: PuppetCommand[] = [
  {
    functionName: "fishCaught(fish)",
    sends: ['CanvasUserInterface.FishCaught(JSON.stringify(fish))'],
    notes: "Show caught fish results UI",
  },
  {
    functionName: "showFishingLocation()",
    sends: [
      'Camera.SetAnimState("ShowFishing")',
      'CanvasUserInterface.SetAnimState("ShowFishing")',
    ],
  },
  {
    functionName: "showFightingLocation()",
    sends: ['Camera.SetAnimState("ShowFighting")'],
    notes: "Canvas UI fight animation currently commented out",
  },
  {
    functionName: "showBreedingLocation()",
    sends: ['Camera.SetAnimState("ShowBreeding")'],
  },
  {
    functionName: "showOceanLocation()",
    sends: [
      'Camera.SetAnimState("ShowOcean")',
      'CanvasUserInterface.SetAnimState("ShowOcean")',
    ],
  },
  {
    functionName: "showHome()",
    sends: [
      'Camera.SetAnimState("ShowHome")',
      'CanvasUserInterface.SetAnimState("ShowHome")',
    ],
  },
  {
    functionName: "showTank()",
    sends: [
      'Camera.SetAnimState("ShowOcean")',
      'CanvasUserInterface.SetAnimState("ShowOcean")',
    ],
  },
  {
    functionName: "showFishUI()",
    sends: ['CanvasUserInterface.SetAnimState("ShowFish")'],
  },
  {
    functionName: "showFishingUI()",
    sends: ['CanvasUserInterface.SetAnimState("ShowFishing")'],
  },
  {
    functionName: "showFightingUI()",
    sends: ['CanvasUserInterface.SetAnimState("ShowFighting")'],
  },
  {
    functionName: "showBreedingUI()",
    sends: ['CanvasUserInterface.SetAnimState("ShowBreeding")'],
  },
  {
    functionName: "clearUIFish()",
    sends: ["FishPool.ClearUIFish()"],
  },
  {
    functionName: "hideUI()",
    sends: ['CanvasUserInterface.SetAnimState("Hide")'],
  },
  {
    functionName: "clearFishPool(pool)",
    sends: ["FishPool.ClearPool(pool)"],
    notes: 'Known pools: "Ocean", "Fighting", "Breeding", "Fishing", "Fish", "ShowFighting", "showOceanLocation"',
  },
  {
    functionName: "addFishOcean(fish)",
    sends: ['FishPool.AddFish_OceanView(JSON.stringify(fish))'],
  },
  {
    functionName: "addFishTank(fish)",
    sends: ['FishPool.AddFish_TankView(JSON.stringify(fish))'],
  },
  {
    functionName: "addFishFightingPool(fish)",
    sends: ['FishPool.AddFish_FightingView(JSON.stringify(fish))'],
  },
  {
    functionName: "addFishBreedingPool(fish)",
    sends: ['FishPool.AddFish_BreedingView(JSON.stringify(fish))'],
  },
  {
    functionName: "addFishFight1(fish)",
    sends: [
      'FishPool.AddFish1_FightingView(JSON.stringify(fish))',
      'FishPool.AddFish1_FishView(JSON.stringify(fish))',
      'CanvasUserInterface.FightingUI_SetFish1(JSON.stringify(fish))',
    ],
  },
  {
    functionName: "addFishFight2(fish)",
    sends: [
      'FishPool.AddFish2_FightingView(JSON.stringify(fish))',
      'FishPool.AddFish2_FishView(JSON.stringify(fish))',
      'CanvasUserInterface.FightingUI_SetFish2(JSON.stringify(fish))',
    ],
  },
  {
    functionName: "addFishBreed1(fish)",
    sends: [
      'FishPool.AddFish1_FishView(JSON.stringify(fish))',
      'CanvasUserInterface.BreedingUI_SetFish1(JSON.stringify(fish))',
    ],
  },
  {
    functionName: "addFishBreed2(fish)",
    sends: [
      'FishPool.AddFish2_FishView(JSON.stringify(fish))',
      'CanvasUserInterface.BreedingUI_SetFish2(JSON.stringify(fish))',
    ],
  },
  {
    functionName: "addBreedOffspring(fish)",
    sends: [
      'CanvasUserInterface.SetAnimState("ShowBreedingResultsSuccess")',
      'CanvasUserInterface.BreedingResultsUI_SetFish1(JSON.stringify(fish))',
      'FishPool.AddFish2_FishView(JSON.stringify(fish.parentAFish))',
      'FishPool.AddFish3_FishView(JSON.stringify(fish.parentBFish))',
      'FishPool.AddFish1_FishView(JSON.stringify(fish))',
    ],
    notes: "Parents only sent if available",
  },
  {
    functionName: "addFishFishing(fish)",
    sends: [
      'FishPool.AddFish_FishingView(JSON.stringify(fish))',
      'FishPool.AddFish1_FishView(JSON.stringify(fish))',
      'CanvasUserInterface.SetAnimState("ShowFishingResultsSuccess")',
      'CanvasUserInterface.FishingResultsUI_SetFish1(JSON.stringify(fish))',
    ],
  },
  {
    functionName: "showFish(fish)",
    sends: [
      'CanvasUserInterface.FishUI_SetFish1(JSON.stringify(fish))',
      'FishPool.AddFish2_FishView(JSON.stringify(fish.parentAFish))',
      'FishPool.AddFish3_FishView(JSON.stringify(fish.parentBFish))',
      'FishPool.AddFish1_FishView(JSON.stringify(fish))',
    ],
    notes: "Parent fish only sent when available",
  },
  {
    functionName: "sendRound(round, stat)",
    sends: [
      "FishPool.SetRound1Stat(roundStat)",
      "FishPool.SetRound2Stat(roundStat)",
      "FishPool.SetRound3Stat(roundStat)",
    ],
    notes: "Uses SetRound{1,2,3}Stat based on round argument",
  },
  {
    functionName: "sendFightResult(fight, fish1, fish2)",
    sends: [
      "FishPool.SetFightResults(JSON.stringify(fight))",
      'CanvasUserInterface.SetAnimState("ShowFightResultsSuccess")',
      'CanvasUserInterface.FightingResultsUI_SetFish1(JSON.stringify(fish1))',
      'CanvasUserInterface.FightingResultsUI_SetFish2(JSON.stringify(fish2))',
    ],
  },
  {
    functionName: "sendTie()",
    sends: ["FishPool.SetTie()"],
  },
];

const knownPools = [
  "Ocean",
  "Fighting",
  "Breeding",
  "Fishing",
  "Fish",
  "ShowFighting",
  "showOceanLocation",
  "ShowBreeding",
];

const PuppetMasterConsole = () => {
  const unity = useUnity();
  const {
    oceanFish,
    userFish,
    fightingFish,
    fightingFishWeak,
    fightingFishNonLethal,
    breedingFish,
  } = useFishPool();

  const [primaryFishId, setPrimaryFishId] = useState<number>();
  const [secondaryFishId, setSecondaryFishId] = useState<number>();
  const [tertiaryFishId, setTertiaryFishId] = useState<number>();
  const [poolName, setPoolName] = useState<string>(knownPools[0]);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [roundStat, setRoundStat] = useState<number>(0);
  const [fightPayload, setFightPayload] = useState<string>(defaultFightPayload);
  const [consoleLog, setConsoleLog] = useState<string[]>([]);

  const fishOptions = useMemo(() => {
    const dedup = new Map<number, Fish>();
    [
      ...oceanFish,
      ...userFish,
      ...fightingFish,
      ...fightingFishWeak,
      ...fightingFishNonLethal,
      ...breedingFish,
    ].forEach((fish) => {
      if (!dedup.has(fish.tokenId)) {
        dedup.set(fish.tokenId, fish);
      }
    });
    return Array.from(dedup.values()).sort((a, b) => a.tokenId - b.tokenId);
  }, [
    oceanFish,
    userFish,
    fightingFish,
    fightingFishWeak,
    fightingFishNonLethal,
    breedingFish,
  ]);

  useEffect(() => {
    if (fishOptions.length === 0) return;
    setPrimaryFishId((prev) => prev ?? fishOptions[0].tokenId);
    setSecondaryFishId((prev) =>
      prev ?? fishOptions[Math.min(1, fishOptions.length - 1)].tokenId
    );
    setTertiaryFishId((prev) =>
      prev ?? fishOptions[Math.min(2, fishOptions.length - 1)].tokenId
    );
  }, [fishOptions]);

  const getFishById = (tokenId?: number) =>
    fishOptions.find((fish) => fish.tokenId === tokenId);

  const primaryFish = getFishById(primaryFishId);
  const secondaryFish = getFishById(secondaryFishId);
  const tertiaryFish = getFishById(tertiaryFishId);

  const pushLog = (message: string) => {
    setConsoleLog((prev) => [
      `${new Date().toLocaleTimeString()} • ${message}`,
      ...prev,
    ]);
  };

  const guardUnityReady = (actionLabel: string, checkPoolReady = true) => {
    if (!unity.isLoaded) {
      pushLog(`${actionLabel}: Unity not loaded yet`);
      return false;
    }
    if (checkPoolReady && !unity.isFishPoolReady) {
      pushLog(`${actionLabel}: Fish pool not ready`);
      return false;
    }
    return true;
  };

  const handleFishAction = (
    label: string,
    fish: Fish | undefined,
    handler: (fish: Fish) => void,
    requiresPoolReady = true
  ) => {
    if (!guardUnityReady(label, requiresPoolReady)) return;
    if (!fish) {
      pushLog(`${label}: Select a fish first`);
      return;
    }
    try {
      handler(fish);
      pushLog(`${label}: Sent for #${fish.tokenId}`);
    } catch (error) {
      pushLog(`${label}: ${String(error)}`);
    }
  };

  const handleFightResult = () => {
    if (!guardUnityReady("sendFightResult")) return;
    if (!primaryFish || !secondaryFish) {
      pushLog("sendFightResult: Select two fish first");
      return;
    }
    try {
      const parsed = JSON.parse(fightPayload) as Fight;
      unity.sendFightResult(parsed, primaryFish, secondaryFish);
      pushLog(
        `sendFightResult: Sent for challenger #${primaryFish.tokenId} vs opponent #${secondaryFish.tokenId}`
      );
    } catch (error) {
      pushLog(`sendFightResult: Invalid JSON payload (${String(error)})`);
    }
  };

  const handleRoundStat = () => {
    if (!guardUnityReady(`sendRound(${roundNumber})`)) return;
    unity.sendRound(roundNumber, roundStat);
    pushLog(`sendRound: Round ${roundNumber} updated to ${roundStat}`);
  };

  const handleClearPool = () => {
    if (!guardUnityReady("clearFishPool")) return;
    unity.clearFishPool(poolName);
    pushLog(`clearFishPool: Requested clear for "${poolName}"`);
  };

  const poolPlaceholder =
    'Try "Ocean", "Fighting", "Breeding", "Fishing", "Fish"...';

  return (
    <BaseContainer>
      <ConsoleCard>
        <Header>
          <BaseTitle>Puppetmaster Console</BaseTitle>
          <StatusGrid>
            <StatusItem>
              <StatusLabel>Unity Loaded</StatusLabel>
              <StatusValue $active={unity.isLoaded}>
                {unity.isLoaded ? "Yes" : "No"}
              </StatusValue>
            </StatusItem>
            <StatusItem>
              <StatusLabel>Fish Pool Ready</StatusLabel>
              <StatusValue $active={unity.isFishPoolReady}>
                {unity.isFishPoolReady ? "Yes" : "No"}
              </StatusValue>
            </StatusItem>
            <StatusItem>
              <StatusLabel>Mounted</StatusLabel>
              <StatusValue $active={unity.isUnityMounted}>
                {unity.isUnityMounted ? "Yes" : "No"}
              </StatusValue>
            </StatusItem>
            <StatusItem>
              <StatusLabel>Progress</StatusLabel>
              <StatusValue $active>
                {(unity.progression * 100).toFixed(0)}%
              </StatusValue>
            </StatusItem>
          </StatusGrid>
          <BaseButtonStyle
            onClick={() => {
              unity.toggleIsUnityMounted();
              pushLog("toggleIsUnityMounted: Toggled Unity mount state");
            }}
          >
            Toggle Mount
          </BaseButtonStyle>
        </Header>

        <Section>
          <SectionTitle>Fish Selection</SectionTitle>
          <SelectionRow>
            <SelectionBlock>
              <Label>Primary</Label>
              <Select
                value={primaryFishId ?? ""}
                onChange={(event) =>
                  setPrimaryFishId(Number(event.target.value))
                }
              >
                {fishOptions.map((fish) => (
                  <option key={fish.tokenId} value={fish.tokenId}>
                    #{fish.tokenId} · R{fish.rarity} · STR {fish.strength}
                  </option>
                ))}
              </Select>
            </SelectionBlock>
            <SelectionBlock>
              <Label>Secondary</Label>
              <Select
                value={secondaryFishId ?? ""}
                onChange={(event) =>
                  setSecondaryFishId(Number(event.target.value))
                }
              >
                {fishOptions.map((fish) => (
                  <option key={fish.tokenId} value={fish.tokenId}>
                    #{fish.tokenId} · R{fish.rarity} · INT {fish.intelligence}
                  </option>
                ))}
              </Select>
            </SelectionBlock>
            <SelectionBlock>
              <Label>Tertiary</Label>
              <Select
                value={tertiaryFishId ?? ""}
                onChange={(event) =>
                  setTertiaryFishId(Number(event.target.value))
                }
              >
                {fishOptions.map((fish) => (
                  <option key={fish.tokenId} value={fish.tokenId}>
                    #{fish.tokenId} · R{fish.rarity} · AGI {fish.agility}
                  </option>
                ))}
              </Select>
            </SelectionBlock>
          </SelectionRow>
          <Hint>
            The dropdown aggregates fish from ocean, user, fighting, breeding,
            and fishing pools. Update the pools with the refresh button in the
            main menu if your fish list looks stale.
          </Hint>
        </Section>

        <Section>
          <SectionTitle>Camera & Locations</SectionTitle>
          <ButtonRow>
            <CommandButton
              onClick={() => {
                if (!guardUnityReady("showHome", false)) return;
                unity.showHome();
                pushLog("showHome: Requested Home camera view");
              }}
            >
              Show Home
            </CommandButton>
            <CommandButton
              onClick={() => {
                if (!guardUnityReady("showOceanLocation")) return;
                unity.showOceanLocation();
                pushLog("showOceanLocation: Requested Ocean view");
              }}
            >
              Show Ocean
            </CommandButton>
            <CommandButton
              onClick={() => {
                if (!guardUnityReady("showFishingLocation")) return;
                unity.showFishingLocation();
                pushLog("showFishingLocation: Requested Fishing view");
              }}
            >
              Show Fishing
            </CommandButton>
            <CommandButton
              onClick={() => {
                if (!guardUnityReady("showFightingLocation")) return;
                unity.showFightingLocation();
                pushLog("showFightingLocation: Requested Fighting view");
              }}
            >
              Show Fighting
            </CommandButton>
            <CommandButton
              onClick={() => {
                if (!guardUnityReady("showBreedingLocation")) return;
                unity.showBreedingLocation();
                pushLog("showBreedingLocation: Requested Breeding view");
              }}
            >
              Show Breeding
            </CommandButton>
            <CommandButton
              onClick={() => {
                if (!guardUnityReady("showTank", false)) return;
                unity.showTank();
                pushLog("showTank: Requested Tank view");
              }}
            >
              Show Tank
            </CommandButton>
          </ButtonRow>
          <Meta>
            Camera.SetAnimState("Show*") — see reference chart for exact
            strings.
          </Meta>
        </Section>

        <Section>
          <SectionTitle>UI State Toggles</SectionTitle>
          <ButtonRow>
            <CommandButton
              onClick={() => {
                if (!guardUnityReady("showFishUI", false)) return;
                unity.showFishUI();
                pushLog("showFishUI: Showing Fish UI overlay");
              }}
            >
              Fish UI
            </CommandButton>
            <CommandButton
              onClick={() => {
                if (!guardUnityReady("showFishingUI", false)) return;
                unity.showFishingUI();
                pushLog("showFishingUI: Showing Fishing UI overlay");
              }}
            >
              Fishing UI
            </CommandButton>
            <CommandButton
              onClick={() => {
                if (!guardUnityReady("showFightingUI", false)) return;
                unity.showFightingUI();
                pushLog("showFightingUI: Showing Fighting UI overlay");
              }}
            >
              Fighting UI
            </CommandButton>
            <CommandButton
              onClick={() => {
                if (!guardUnityReady("showBreedingUI", false)) return;
                unity.showBreedingUI();
                pushLog("showBreedingUI: Showing Breeding UI overlay");
              }}
            >
              Breeding UI
            </CommandButton>
            <CommandButton
              onClick={() => {
                if (!guardUnityReady("hideUI", false)) return;
                unity.hideUI();
                pushLog("hideUI: Hiding Canvas UI");
              }}
            >
              Hide UI
            </CommandButton>
            <CommandButton
              onClick={() => {
                if (!guardUnityReady("clearUIFish")) return;
                unity.clearUIFish();
                pushLog("clearUIFish: Cleared UI fish slots");
              }}
            >
              Clear UI Fish
            </CommandButton>
          </ButtonRow>
          <Meta>CanvasUserInterface.SetAnimState("*") & FishPool.ClearUIFish</Meta>
        </Section>

        <Section>
          <SectionTitle>Fish Pool Management</SectionTitle>
          <SelectionRow>
            <SelectionBlock>
              <Label>Pool Identifier</Label>
              <Select
                value={poolName}
                onChange={(event) => setPoolName(event.target.value)}
              >
                {knownPools.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
              <Input
                value={poolName}
                onChange={(event) => setPoolName(event.target.value)}
                placeholder={poolPlaceholder}
              />
            </SelectionBlock>
            <SelectionBlock>
              <Label>Actions</Label>
              <ButtonRow>
                <CommandButton onClick={handleClearPool}>
                  Clear Fish Pool
                </CommandButton>
                <CommandButton
                  onClick={() =>
                    handleFishAction(
                      "addFishOcean",
                      primaryFish,
                      unity.addFishOcean
                    )
                  }
                >
                  Add to Ocean View
                </CommandButton>
                <CommandButton
                  onClick={() =>
                    handleFishAction(
                      "addFishTank",
                      primaryFish,
                      unity.addFishTank
                    )
                  }
                >
                  Add to Tank View
                </CommandButton>
                <CommandButton
                  onClick={() =>
                    handleFishAction(
                      "addFishFightingPool",
                      primaryFish,
                      unity.addFishFightingPool
                    )
                  }
                >
                  Add to Fighting Pool
                </CommandButton>
                <CommandButton
                  onClick={() =>
                    handleFishAction(
                      "addFishBreedingPool",
                      primaryFish,
                      unity.addFishBreedingPool
                    )
                  }
                >
                  Add to Breeding Pool
                </CommandButton>
              </ButtonRow>
            </SelectionBlock>
          </SelectionRow>
          <Meta>FishPool.AddFish_* and FishPool.ClearPool(pool)</Meta>
        </Section>

        <Section>
          <SectionTitle>Fishing Results & Showcase</SectionTitle>
          <ButtonRow>
            <CommandButton
              onClick={() =>
                handleFishAction("fishCaught", primaryFish, unity.fishCaught)
              }
            >
              Trigger Fish Caught
            </CommandButton>
            <CommandButton
              onClick={() =>
                handleFishAction("addFishFishing", primaryFish, unity.addFishFishing)
              }
            >
              Add Fishing Result
            </CommandButton>
            <CommandButton
              onClick={() =>
                handleFishAction("showFish", primaryFish, unity.showFish)
              }
            >
              Show Fish Detail
            </CommandButton>
            <CommandButton
              onClick={() => {
                if (!guardUnityReady("refreshFishUnity")) return;
                if (!primaryFish) {
                  pushLog("refreshFishUnity: Select a fish first");
                  return;
                }
                unity.refreshFishUnity(primaryFish);
                pushLog(
                  `refreshFishUnity: Refreshed fish #${primaryFish.tokenId}`
                );
              }}
            >
              Refresh Fish Unity
            </CommandButton>
          </ButtonRow>
          <Meta>
            Fish caught & showcase actions rely on CanvasUserInterface.Fish*
            setters.
          </Meta>
        </Section>

        <Section>
          <SectionTitle>Fight Controls</SectionTitle>
          <ButtonRow>
            <CommandButton
              onClick={() =>
                handleFishAction("addFishFight1", primaryFish, unity.addFishFight1)
              }
            >
              Set Fighter 1
            </CommandButton>
            <CommandButton
              onClick={() =>
                handleFishAction("addFishFight2", secondaryFish, unity.addFishFight2)
              }
            >
              Set Fighter 2
            </CommandButton>
            <CommandButton onClick={handleFightResult}>
              Send Fight Result
            </CommandButton>
            <CommandButton
              onClick={() => {
                if (!guardUnityReady("sendTie")) return;
                unity.sendTie();
                pushLog("sendTie: Declared a tie");
              }}
            >
              Send Tie
            </CommandButton>
          </ButtonRow>
          <SelectionRow>
            <SelectionBlock>
              <Label>Round Stat</Label>
              <Select
                value={roundNumber}
                onChange={(event) => setRoundNumber(Number(event.target.value))}
              >
                <option value={1}>Round 1 (Strength)</option>
                <option value={2}>Round 2 (Intelligence)</option>
                <option value={3}>Round 3 (Agility)</option>
              </Select>
              <Input
                type="number"
                value={roundStat}
                onChange={(event) => setRoundStat(Number(event.target.value))}
              />
              <CommandButton onClick={handleRoundStat}>
                Update Round Stat
              </CommandButton>
            </SelectionBlock>
            <SelectionBlock>
              <Label>Fight Result Payload (JSON)</Label>
              <Textarea
                value={fightPayload}
                onChange={(event) => setFightPayload(event.target.value)}
              />
              <Hint>
                Provide the raw fight payload from the contract or keep the demo
                structure above and edit values. Must be valid JSON.
              </Hint>
            </SelectionBlock>
          </SelectionRow>
          <Meta>
            Fight sequences leverage FishPool.AddFish{1|2}_FightingView,
            CanvasUserInterface.FightingUI_SetFish*, FishPool.SetFightResults,
            and CanvasUserInterface.FightingResultsUI_SetFish*.
          </Meta>
        </Section>

        <Section>
          <SectionTitle>Breeding Controls</SectionTitle>
          <ButtonRow>
            <CommandButton
              onClick={() =>
                handleFishAction("addFishBreed1", primaryFish, unity.addFishBreed1)
              }
            >
              Set Betta (Fish 1)
            </CommandButton>
            <CommandButton
              onClick={() =>
                handleFishAction("addFishBreed2", secondaryFish, unity.addFishBreed2)
              }
            >
              Set Alpha (Fish 2)
            </CommandButton>
            <CommandButton
              onClick={() =>
                handleFishAction(
                  "addBreedOffspring",
                  tertiaryFish ?? primaryFish,
                  unity.addBreedOffspring,
                  false
                )
              }
            >
              Show Breeding Result
            </CommandButton>
          </ButtonRow>
          <Meta>
            Breeding UI uses CanvasUserInterface.BreedingUI_SetFish* and
            BreedingResultsUI_SetFish* plus FishPool.AddFish*.
          </Meta>
        </Section>

        <Section>
          <SectionTitle>Command Reference</SectionTitle>
          <ReferenceTable>
            <thead>
              <tr>
                <th>Unity Context Function</th>
                <th>Unity Send Calls</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {commandReference.map((command) => (
                <tr key={command.functionName}>
                  <td>
                    <code>{command.functionName}</code>
                  </td>
                  <td>
                    {command.sends.map((send) => (
                      <div key={send}>
                        <code>{send}</code>
                      </div>
                    ))}
                  </td>
                  <td>{command.notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </ReferenceTable>
        </Section>

        <Section>
          <SectionTitle>Console Log</SectionTitle>
          <LogPanel>
            {consoleLog.length === 0 ? (
              <BaseText>No commands invoked yet.</BaseText>
            ) : (
              consoleLog.map((entry) => <LogEntry key={entry}>{entry}</LogEntry>)
            )}
          </LogPanel>
        </Section>
      </ConsoleCard>
    </BaseContainer>
  );
};

const ConsoleCard = styled(UIContainer)`
  width: 95%;
  max-width: 1100px;
  max-height: 95%;
  overflow-y: auto;
  align-items: stretch;
  gap: ${(props) => props.theme.spacing.gap};
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.gapSmall};
  align-items: flex-start;

  ${BaseTitle} {
    margin-bottom: ${(props) => props.theme.spacing.gapSmall};
  }

  ${BaseButtonStyle} {
    align-self: flex-end;
  }
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: ${(props) => props.theme.spacing.gapSmall};
  width: 100%;
`;

const StatusItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: ${(props) => props.theme.spacing.gapSmall};
  background: rgba(0, 0, 0, 0.15);
  border-radius: 12px;
`;

const StatusLabel = styled.span`
  font-size: ${(props) => props.theme.font.small};
  color: rgba(0, 0, 0, 0.6);
`;

const StatusValue = styled.span<{ $active: boolean }>`
  font-size: ${(props) => props.theme.font.medium};
  font-weight: bold;
  color: ${(props) => (props.$active ? "#0c7a4d" : "#b00020")};
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.gapSmall};
  padding: ${(props) => props.theme.spacing.gap};
  background: rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  color: black;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: ${(props) => props.theme.font.medium};
  text-transform: uppercase;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${(props) => props.theme.spacing.gapSmall};
`;

const CommandButton = styled(BaseButtonStyle)`
  min-width: 140px;
  font-size: ${(props) => props.theme.font.small};
`;

const SelectionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${(props) => props.theme.spacing.gap};
`;

const SelectionBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.gapSmall};
  min-width: 240px;
  flex: 1;
`;

const Label = styled.label`
  font-weight: bold;
  font-size: ${(props) => props.theme.font.small};
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  font-size: ${(props) => props.theme.font.small};
`;

const Input = styled.input`
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  font-size: ${(props) => props.theme.font.small};
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 140px;
  padding: ${(props) => props.theme.spacing.gapSmall};
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  font-family: "Source Code Pro", monospace;
  font-size: ${(props) => props.theme.font.small};
`;

const Hint = styled(BaseText)`
  color: rgba(0, 0, 0, 0.7);
  font-style: italic;
`;

const Meta = styled(BaseText)`
  color: rgba(0, 0, 0, 0.6);
  font-size: ${(props) => props.theme.font.small};
`;

const ReferenceTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.6);

  th,
  td {
    text-align: left;
    padding: ${(props) => props.theme.spacing.gapSmall};
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    vertical-align: top;
  }

  th {
    font-size: ${(props) => props.theme.font.small};
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  code {
    font-family: "Source Code Pro", monospace;
    font-size: 0.9em;
  }
`;

const LogPanel = styled.div`
  max-height: 180px;
  overflow-y: auto;
  padding: ${(props) => props.theme.spacing.gapSmall};
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.08);
`;

const LogEntry = styled.div`
  font-family: "Source Code Pro", monospace;
  font-size: 0.85em;
  margin-bottom: 4px;
`;

export default PuppetMasterConsole;
