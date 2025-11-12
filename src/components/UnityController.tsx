// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useUnity } from "../context/unityContext";
import { useFishPool } from "../context/fishPoolContext";
import { Fish } from "../utils/fish";
import { Fight } from "../utils/fight";
import BaseButton from "./BaseButton";

const UnityController = () => {
  const unityContext = useUnity();
  const { fightingFish, userFish } = useFishPool();
  const [unityLogs, setUnityLogs] = useState<string[]>([]);
  const [selectedFish1, setSelectedFish1] = useState<Fish | null>(null);
  const [selectedFish2, setSelectedFish2] = useState<Fish | null>(null);
  const [testFight, setTestFight] = useState<Fight | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setUnityLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [unityLogs]);

  // Listen to Unity events
  useEffect(() => {
    const events = [
      "progress",
      "loaded",
      "error",
      "log",
      "canvas",
      "CameraStartConfirm",
      "CanvasUIStartConfirm",
      "UISelectionConfirm",
      "FishPoolStartConfirm",
      "SetAnimStateConfirm",
      "ClearPoolConfirm",
      "AddFishConfirm",
      "SetFishingStateConfirm",
      "SetFightStateConfirm",
      "FishCaughtReceived",
      "FishPoolFightRound1",
      "FishPoolFightRound2",
      "FishPoolFightRound3",
      "UI_Fighting_Start_Request",
    ];

    events.forEach((eventName) => {
      unityContext.UnityInstance.on(eventName, function (data: any) {
        addLog(`Unity Event: ${eventName} - ${JSON.stringify(data)}`);
      });
    });

    return () => {
      events.forEach((eventName) => {
        unityContext.UnityInstance.removeAllListeners(eventName);
      });
    };
  }, [unityContext.UnityInstance]);

  const handleUnityCall = (methodName: string, fn: () => void) => {
    try {
      addLog(`Calling: ${methodName}`);
      fn();
      addLog(`Success: ${methodName}`);
    } catch (error: any) {
      addLog(`Error in ${methodName}: ${error.message}`);
    }
  };

  const createTestFight = (): Fight => {
    return {
      typeOfFight: 0,
      fishChallenger: selectedFish1?.tokenId || 1,
      fishChallenged: selectedFish2?.tokenId || 2,
      timeOfFight: Math.floor(Date.now() / 1000),
      round1: { value: 0, description: "Strength" },
      round2: { value: 1, description: "Intelligence" },
      round3: { value: 2, description: "Agility" },
      winner: selectedFish1?.tokenId || 1,
      playerResult: 1,
    };
  };

  return (
    <Container>
      <Header>
        <Title>Unity Context Controller</Title>
        <StatusBar>
          <StatusItem>
            <StatusLabel>Loaded:</StatusLabel>
            <StatusValue className={unityContext.isLoaded ? "ready" : "not-ready"}>
              {unityContext.isLoaded ? "✓" : "✗"}
            </StatusValue>
          </StatusItem>
          <StatusItem>
            <StatusLabel>Fish Pool Ready:</StatusLabel>
            <StatusValue className={unityContext.isFishPoolReady ? "ready" : "not-ready"}>
              {unityContext.isFishPoolReady ? "✓" : "✗"}
            </StatusValue>
          </StatusItem>
          <StatusItem>
            <StatusLabel>Mounted:</StatusLabel>
            <StatusValue className={unityContext.isUnityMounted ? "ready" : "not-ready"}>
              {unityContext.isUnityMounted ? "✓" : "✗"}
            </StatusValue>
          </StatusItem>
          <StatusItem>
            <StatusLabel>Progress:</StatusLabel>
            <StatusValue>{(unityContext.progression * 100).toFixed(0)}%</StatusValue>
          </StatusItem>
        </StatusBar>
      </Header>

      <Content>
        <LeftPanel>
          <Section>
            <SectionTitle>Location Controls</SectionTitle>
            <ButtonGrid>
              <BaseButton onClick={() => handleUnityCall("showHome", unityContext.showHome)}>
                Show Home
              </BaseButton>
              <BaseButton onClick={() => handleUnityCall("showOceanLocation", unityContext.showOceanLocation)}>
                Show Ocean
              </BaseButton>
              <BaseButton onClick={() => handleUnityCall("showFishingLocation", unityContext.showFishingLocation)}>
                Show Fishing
              </BaseButton>
              <BaseButton onClick={() => handleUnityCall("showFightingLocation", unityContext.showFightingLocation)}>
                Show Fighting
              </BaseButton>
              <BaseButton onClick={() => handleUnityCall("showBreedingLocation", unityContext.showBreedingLocation)}>
                Show Breeding
              </BaseButton>
              <BaseButton onClick={() => handleUnityCall("showTank", unityContext.showTank)}>
                Show Tank
              </BaseButton>
            </ButtonGrid>
          </Section>

          <Section>
            <SectionTitle>UI Controls</SectionTitle>
            <ButtonGrid>
              <BaseButton onClick={() => handleUnityCall("showFishUI", unityContext.showFishUI)}>
                Show Fish UI
              </BaseButton>
              <BaseButton onClick={() => handleUnityCall("showFishingUI", unityContext.showFishingUI)}>
                Show Fishing UI
              </BaseButton>
              <BaseButton onClick={() => handleUnityCall("showFightingUI", unityContext.showFightingUI)}>
                Show Fighting UI
              </BaseButton>
              <BaseButton onClick={() => handleUnityCall("showBreedingUI", unityContext.showBreedingUI)}>
                Show Breeding UI
              </BaseButton>
              <BaseButton onClick={() => handleUnityCall("hideUI", unityContext.hideUI)}>
                Hide UI
              </BaseButton>
              <BaseButton onClick={() => handleUnityCall("clearUIFish", unityContext.clearUIFish)}>
                Clear UI Fish
              </BaseButton>
            </ButtonGrid>
          </Section>

          <Section>
            <SectionTitle>Fighting Animation Controls</SectionTitle>
            <FishSelector>
              <FishSelectGroup>
                <Label>Fish 1 (Challenger):</Label>
                <Select
                  value={selectedFish1?.tokenId || ""}
                  onChange={(e) => {
                    const fish = [...userFish, ...fightingFish].find(
                      (f) => f.tokenId === Number(e.target.value)
                    );
                    setSelectedFish1(fish || null);
                  }}
                >
                  <option value="">Select Fish 1</option>
                  {[...userFish, ...fightingFish].map((fish) => (
                    <option key={fish.tokenId} value={fish.tokenId}>
                      Fish #{fish.tokenId} - {fish.name}
                    </option>
                  ))}
                </Select>
              </FishSelectGroup>
              <FishSelectGroup>
                <Label>Fish 2 (Opponent):</Label>
                <Select
                  value={selectedFish2?.tokenId || ""}
                  onChange={(e) => {
                    const fish = [...userFish, ...fightingFish].find(
                      (f) => f.tokenId === Number(e.target.value)
                    );
                    setSelectedFish2(fish || null);
                  }}
                >
                  <option value="">Select Fish 2</option>
                  {[...userFish, ...fightingFish].map((fish) => (
                    <option key={fish.tokenId} value={fish.tokenId}>
                      Fish #{fish.tokenId} - {fish.name}
                    </option>
                  ))}
                </Select>
              </FishSelectGroup>
            </FishSelector>
            <ButtonGrid>
              <BaseButton
                onClick={() => {
                  if (selectedFish1) {
                    handleUnityCall("addFishFight1", () => unityContext.addFishFight1(selectedFish1));
                  } else {
                    addLog("Error: Please select Fish 1");
                  }
                }}
                disabled={!selectedFish1}
              >
                Add Fish 1 to Fight
              </BaseButton>
              <BaseButton
                onClick={() => {
                  if (selectedFish2) {
                    handleUnityCall("addFishFight2", () => unityContext.addFishFight2(selectedFish2));
                  } else {
                    addLog("Error: Please select Fish 2");
                  }
                }}
                disabled={!selectedFish2}
              >
                Add Fish 2 to Fight
              </BaseButton>
              <BaseButton
                onClick={() => {
                  if (selectedFish1 && selectedFish2) {
                    const fight = createTestFight();
                    handleUnityCall("sendFightResult", () =>
                      unityContext.sendFightResult(fight, selectedFish1, selectedFish2)
                    );
                    setTestFight(fight);
                  } else {
                    addLog("Error: Please select both Fish 1 and Fish 2");
                  }
                }}
                disabled={!selectedFish1 || !selectedFish2}
              >
                Send Fight Result
              </BaseButton>
              <BaseButton
                onClick={() => {
                  handleUnityCall("sendRound(1)", () => unityContext.sendRound(1, 0));
                }}
              >
                Send Round 1
              </BaseButton>
              <BaseButton
                onClick={() => {
                  handleUnityCall("sendRound(2)", () => unityContext.sendRound(2, 1));
                }}
              >
                Send Round 2
              </BaseButton>
              <BaseButton
                onClick={() => {
                  handleUnityCall("sendRound(3)", () => unityContext.sendRound(3, 2));
                }}
              >
                Send Round 3
              </BaseButton>
              <BaseButton onClick={() => handleUnityCall("sendTie", unityContext.sendTie)}>
                Send Tie
              </BaseButton>
            </ButtonGrid>
          </Section>

          <Section>
            <SectionTitle>Fish Pool Controls</SectionTitle>
            <ButtonGrid>
              <BaseButton
                onClick={() => {
                  if (selectedFish1) {
                    handleUnityCall("addFishOcean", () => unityContext.addFishOcean(selectedFish1));
                  } else {
                    addLog("Error: Please select Fish 1");
                  }
                }}
                disabled={!selectedFish1}
              >
                Add Fish to Ocean
              </BaseButton>
              <BaseButton
                onClick={() => {
                  if (selectedFish1) {
                    handleUnityCall("addFishTank", () => unityContext.addFishTank(selectedFish1));
                  } else {
                    addLog("Error: Please select Fish 1");
                  }
                }}
                disabled={!selectedFish1}
              >
                Add Fish to Tank
              </BaseButton>
              <BaseButton
                onClick={() => {
                  if (selectedFish1) {
                    handleUnityCall("addFishFightingPool", () =>
                      unityContext.addFishFightingPool(selectedFish1)
                    );
                  } else {
                    addLog("Error: Please select Fish 1");
                  }
                }}
                disabled={!selectedFish1}
              >
                Add Fish to Fighting Pool
              </BaseButton>
              <BaseButton
                onClick={() => {
                  if (selectedFish1) {
                    handleUnityCall("addFishBreedingPool", () =>
                      unityContext.addFishBreedingPool(selectedFish1)
                    );
                  } else {
                    addLog("Error: Please select Fish 1");
                  }
                }}
                disabled={!selectedFish1}
              >
                Add Fish to Breeding Pool
              </BaseButton>
              <BaseButton
                onClick={() => {
                  if (selectedFish1) {
                    handleUnityCall("addFishFishing", () => unityContext.addFishFishing(selectedFish1));
                  } else {
                    addLog("Error: Please select Fish 1");
                  }
                }}
                disabled={!selectedFish1}
              >
                Add Fish Fishing
              </BaseButton>
              <BaseButton
                onClick={() => {
                  if (selectedFish1) {
                    handleUnityCall("showFish", () => unityContext.showFish(selectedFish1));
                  } else {
                    addLog("Error: Please select Fish 1");
                  }
                }}
                disabled={!selectedFish1}
              >
                Show Fish
              </BaseButton>
              <BaseButton
                onClick={() => {
                  if (selectedFish1) {
                    handleUnityCall("refreshFishUnity", () =>
                      unityContext.refreshFishUnity(selectedFish1)
                    );
                  } else {
                    addLog("Error: Please select Fish 1");
                  }
                }}
                disabled={!selectedFish1}
              >
                Refresh Fish Unity
              </BaseButton>
            </ButtonGrid>
            <ButtonGrid>
              <BaseButton onClick={() => handleUnityCall("clearFishPool(Fighting)", () => unityContext.clearFishPool("Fighting"))}>
                Clear Fighting Pool
              </BaseButton>
              <BaseButton onClick={() => handleUnityCall("clearFishPool(Breeding)", () => unityContext.clearFishPool("Breeding"))}>
                Clear Breeding Pool
              </BaseButton>
              <BaseButton onClick={() => handleUnityCall("clearFishPool(Ocean)", () => unityContext.clearFishPool("Ocean"))}>
                Clear Ocean Pool
              </BaseButton>
            </ButtonGrid>
          </Section>

          <Section>
            <SectionTitle>Unity Instance Controls</SectionTitle>
            <ButtonGrid>
              <BaseButton onClick={() => handleUnityCall("toggleIsUnityMounted", unityContext.toggleIsUnityMounted)}>
                Toggle Mounted
              </BaseButton>
            </ButtonGrid>
          </Section>
        </LeftPanel>

        <RightPanel>
          <Section>
            <SectionHeader>
              <SectionTitle>Unity Event Logs</SectionTitle>
              <BaseButton onClick={() => setUnityLogs([])}>Clear Logs</BaseButton>
            </SectionHeader>
            <LogContainer>
              {unityLogs.length === 0 ? (
                <EmptyLogs>No logs yet. Unity events will appear here.</EmptyLogs>
              ) : (
                unityLogs.map((log, index) => (
                  <LogLine key={index}>{log}</LogLine>
                ))
              )}
              <div ref={logsEndRef} />
            </LogContainer>
          </Section>

          {testFight && (
            <Section>
              <SectionTitle>Last Test Fight Data</SectionTitle>
              <CodeBlock>
                <pre>{JSON.stringify(testFight, null, 2)}</pre>
              </CodeBlock>
            </Section>
          )}

          {selectedFish1 && (
            <Section>
              <SectionTitle>Selected Fish 1</SectionTitle>
              <CodeBlock>
                <pre>{JSON.stringify(selectedFish1, null, 2)}</pre>
              </CodeBlock>
            </Section>
          )}

          {selectedFish2 && (
            <Section>
              <SectionTitle>Selected Fish 2</SectionTitle>
              <CodeBlock>
                <pre>{JSON.stringify(selectedFish2, null, 2)}</pre>
              </CodeBlock>
            </Section>
          )}
        </RightPanel>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: rgba(26, 26, 26, 0.95);
  color: white;
  overflow: hidden;
  pointer-events: auto;
  z-index: 10;
`;

const Header = styled.div`
  padding: 20px;
  background-color: #2a2a2a;
  border-bottom: 2px solid #444;
`;

const Title = styled.h1`
  margin: 0 0 15px 0;
  font-size: 24px;
  color: #fff;
`;

const StatusBar = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusLabel = styled.span`
  font-weight: bold;
  color: #aaa;
`;

const StatusValue = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  
  &.ready {
    background-color: #4caf50;
    color: white;
  }
  
  &.not-ready {
    background-color: #f44336;
    color: white;
  }
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const LeftPanel = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  border-right: 2px solid #444;
`;

const RightPanel = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #1e1e1e;
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #fff;
  border-bottom: 1px solid #444;
  padding-bottom: 8px;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
`;

const FishSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 15px;
`;

const FishSelectGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: bold;
  color: #aaa;
  font-size: 14px;
`;

const Select = styled.select`
  padding: 8px;
  background-color: #2a2a2a;
  color: white;
  border: 1px solid #444;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #4caf50;
  }
`;

const LogContainer = styled.div`
  background-color: #1a1a1a;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 15px;
  max-height: 500px;
  overflow-y: auto;
  font-family: "Courier New", monospace;
  font-size: 12px;
`;

const LogLine = styled.div`
  margin-bottom: 5px;
  color: #4caf50;
  word-break: break-all;
`;

const EmptyLogs = styled.div`
  color: #666;
  text-align: center;
  padding: 20px;
`;

const CodeBlock = styled.div`
  background-color: #1a1a1a;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 15px;
  overflow-x: auto;
  
  pre {
    margin: 0;
    color: #4caf50;
    font-family: "Courier New", monospace;
    font-size: 12px;
    white-space: pre-wrap;
    word-break: break-all;
  }
`;

export default UnityController;
