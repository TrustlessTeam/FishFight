// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useUnity } from "../context/unityContext";
import { Fish } from "../utils/fish";
import { Fight } from "../utils/fight";

const UnityController = () => {
  const unityContext = useUnity();
  const [eventLog, setEventLog] = useState<Array<{ time: string; event: string; data?: any }>>([]);
  const [testFish1, setTestFish1] = useState<string>("");
  const [testFish2, setTestFish2] = useState<string>("");
  const [testFight, setTestFight] = useState<string>("");
  const logEndRef = useRef<HTMLDivElement>(null);

  // Add event listeners to capture Unity events
  useEffect(() => {
    const events = [
      "progress",
      "loaded",
      "error",
      "log",
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
    ];

    const handlers: Array<() => void> = [];

    events.forEach((eventName) => {
      const handler = (data?: any) => {
        const logEntry = {
          time: new Date().toLocaleTimeString(),
          event: eventName,
          data: data,
        };
        setEventLog((prev) => [...prev, logEntry]);
      };
      unityContext.UnityInstance.on(eventName, handler);
      handlers.push(() => {
        unityContext.UnityInstance.removeAllListeners(eventName);
      });
    });

    return () => {
      handlers.forEach((cleanup) => cleanup());
    };
  }, [unityContext.UnityInstance]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [eventLog]);

  const addLogEntry = (action: string, data?: any) => {
    setEventLog((prev) => [
      ...prev,
      {
        time: new Date().toLocaleTimeString(),
        event: `[ACTION] ${action}`,
        data: data,
      },
    ]);
  };

  const handleSendMessage = (gameObject: string, method: string, value?: string) => {
    try {
      if (value) {
        unityContext.UnityInstance.send(gameObject, method, value);
        addLogEntry(`send(${gameObject}, ${method}, ${value})`);
      } else {
        unityContext.UnityInstance.send(gameObject, method);
        addLogEntry(`send(${gameObject}, ${method})`);
      }
    } catch (error) {
      addLogEntry(`ERROR: ${error}`, error);
    }
  };

  const handleTestFight = () => {
    try {
      let fish1: Fish | null = null;
      let fish2: Fish | null = null;
      let fight: Fight | null = null;

      if (testFish1) {
        fish1 = JSON.parse(testFish1);
        unityContext.addFishFight1(fish1);
        addLogEntry("addFishFight1", fish1);
      }

      if (testFish2) {
        fish2 = JSON.parse(testFish2);
        unityContext.addFishFight2(fish2);
        addLogEntry("addFishFight2", fish2);
      }

      if (testFight && fish1 && fish2) {
        fight = JSON.parse(testFight);
        unityContext.sendFightResult(fight, fish1, fish2);
        addLogEntry("sendFightResult", { fight, fish1, fish2 });
      }
    } catch (error) {
      addLogEntry(`ERROR parsing JSON: ${error}`, error);
    }
  };

  const handleSendRound = (round: number, stat: number) => {
    unityContext.sendRound(round, stat);
    addLogEntry(`sendRound(${round}, ${stat})`);
  };

  const clearLog = () => {
    setEventLog([]);
  };

  return (
    <Container>
      <Header>
        <Title>Unity Controller - Fighting Animation Debug</Title>
        <StatusBar>
          <StatusItem>
            <StatusLabel>Loaded:</StatusLabel>
            <StatusValue isActive={unityContext.isLoaded}>
              {unityContext.isLoaded ? "✓" : "✗"}
            </StatusValue>
          </StatusItem>
          <StatusItem>
            <StatusLabel>Fish Pool Ready:</StatusLabel>
            <StatusValue isActive={unityContext.isFishPoolReady}>
              {unityContext.isFishPoolReady ? "✓" : "✗"}
            </StatusValue>
          </StatusItem>
          <StatusItem>
            <StatusLabel>Mounted:</StatusLabel>
            <StatusValue isActive={unityContext.isUnityMounted}>
              {unityContext.isUnityMounted ? "✓" : "✗"}
            </StatusValue>
          </StatusItem>
          <StatusItem>
            <StatusLabel>Progress:</StatusLabel>
            <StatusValue isActive={true}>
              {(unityContext.progression * 100).toFixed(0)}%
            </StatusValue>
          </StatusItem>
          <StatusItem>
            <StatusLabel>Location:</StatusLabel>
            <StatusValue isActive={true}>
              {unityContext.currentLocation === 0 ? "Ocean" : 
               unityContext.currentLocation === 1 ? "Fishing" :
               unityContext.currentLocation === 2 ? "Fighting" :
               unityContext.currentLocation === 3 ? "Breeding" : "Unknown"}
            </StatusValue>
          </StatusItem>
        </StatusBar>
      </Header>

      <Content>
        <LeftPanel>
          <Section>
            <SectionTitle>Location Controls</SectionTitle>
            <ButtonGroup>
              <Button onClick={() => { unityContext.showHome(); addLogEntry("showHome"); }}>
                Show Home
              </Button>
              <Button onClick={() => { unityContext.showOceanLocation(); addLogEntry("showOceanLocation"); }}>
                Show Ocean
              </Button>
              <Button onClick={() => { unityContext.showFishingLocation(); addLogEntry("showFishingLocation"); }}>
                Show Fishing
              </Button>
              <Button onClick={() => { unityContext.showFightingLocation(); addLogEntry("showFightingLocation"); }}>
                Show Fighting
              </Button>
              <Button onClick={() => { unityContext.showBreedingLocation(); addLogEntry("showBreedingLocation"); }}>
                Show Breeding
              </Button>
              <Button onClick={() => { unityContext.showTank(); addLogEntry("showTank"); }}>
                Show Tank
              </Button>
            </ButtonGroup>
          </Section>

          <Section>
            <SectionTitle>UI Controls</SectionTitle>
            <ButtonGroup>
              <Button onClick={() => { unityContext.showFishUI(); addLogEntry("showFishUI"); }}>
                Show Fish UI
              </Button>
              <Button onClick={() => { unityContext.showFishingUI(); addLogEntry("showFishingUI"); }}>
                Show Fishing UI
              </Button>
              <Button onClick={() => { unityContext.showFightingUI(); addLogEntry("showFightingUI"); }}>
                Show Fighting UI
              </Button>
              <Button onClick={() => { unityContext.showBreedingUI(); addLogEntry("showBreedingUI"); }}>
                Show Breeding UI
              </Button>
              <Button onClick={() => { unityContext.hideUI(); addLogEntry("hideUI"); }}>
                Hide UI
              </Button>
            </ButtonGroup>
          </Section>

          <Section>
            <SectionTitle>Fighting Controls</SectionTitle>
            <ButtonGroup>
              <Button onClick={() => { unityContext.clearUIFish(); addLogEntry("clearUIFish"); }}>
                Clear UI Fish
              </Button>
              <Button onClick={() => { unityContext.clearFishPool("Fighting"); addLogEntry("clearFishPool(Fighting)"); }}>
                Clear Fighting Pool
              </Button>
              <Button onClick={() => { unityContext.clearFishPool("Breeding"); addLogEntry("clearFishPool(Breeding)"); }}>
                Clear Breeding Pool
              </Button>
              <Button onClick={() => { unityContext.sendTie(); addLogEntry("sendTie"); }}>
                Send Tie
              </Button>
            </ButtonGroup>
          </Section>

          <Section>
            <SectionTitle>Round Controls</SectionTitle>
            <ButtonGroup>
              <Button onClick={() => handleSendRound(1, 0)}>Round 1 - Strength</Button>
              <Button onClick={() => handleSendRound(1, 1)}>Round 1 - Intelligence</Button>
              <Button onClick={() => handleSendRound(1, 2)}>Round 1 - Agility</Button>
              <Button onClick={() => handleSendRound(2, 0)}>Round 2 - Strength</Button>
              <Button onClick={() => handleSendRound(2, 1)}>Round 2 - Intelligence</Button>
              <Button onClick={() => handleSendRound(2, 2)}>Round 2 - Agility</Button>
              <Button onClick={() => handleSendRound(3, 0)}>Round 3 - Strength</Button>
              <Button onClick={() => handleSendRound(3, 1)}>Round 3 - Intelligence</Button>
              <Button onClick={() => handleSendRound(3, 2)}>Round 3 - Agility</Button>
            </ButtonGroup>
          </Section>

          <Section>
            <SectionTitle>Direct Unity Messages</SectionTitle>
            <InputGroup>
              <Label>GameObject:</Label>
              <Input id="gameObject" placeholder="e.g., Camera, FishPool, CanvasUserInterface" />
            </InputGroup>
            <InputGroup>
              <Label>Method:</Label>
              <Input id="method" placeholder="e.g., SetAnimState, AddFish1_FightingView" />
            </InputGroup>
            <InputGroup>
              <Label>Value (optional):</Label>
              <TextArea id="value" placeholder='e.g., "ShowFighting" or JSON string' rows={3} />
            </InputGroup>
            <Button onClick={() => {
              const gameObject = (document.getElementById("gameObject") as HTMLInputElement)?.value;
              const method = (document.getElementById("method") as HTMLInputElement)?.value;
              const value = (document.getElementById("value") as HTMLTextAreaElement)?.value;
              if (gameObject && method) {
                handleSendMessage(gameObject, method, value || undefined);
              }
            }}>
              Send Message
            </Button>
          </Section>

          <Section>
            <SectionTitle>Test Fight (JSON)</SectionTitle>
            <InputGroup>
              <Label>Fish 1 (JSON):</Label>
              <TextArea
                value={testFish1}
                onChange={(e) => setTestFish1(e.target.value)}
                placeholder='{"tokenId": 1, ...}'
                rows={4}
              />
            </InputGroup>
            <InputGroup>
              <Label>Fish 2 (JSON):</Label>
              <TextArea
                value={testFish2}
                onChange={(e) => setTestFish2(e.target.value)}
                placeholder='{"tokenId": 2, ...}'
                rows={4}
              />
            </InputGroup>
            <InputGroup>
              <Label>Fight Result (JSON):</Label>
              <TextArea
                value={testFight}
                onChange={(e) => setTestFight(e.target.value)}
                placeholder='{"winner": 1, "round1": {...}, ...}'
                rows={4}
              />
            </InputGroup>
            <Button onClick={handleTestFight}>Test Fight Animation</Button>
          </Section>
        </LeftPanel>

        <RightPanel>
          <Section>
            <SectionHeader>
              <SectionTitle>Event Log</SectionTitle>
              <Button onClick={clearLog}>Clear Log</Button>
            </SectionHeader>
            <LogContainer>
              {eventLog.length === 0 ? (
                <EmptyLog>No events yet. Actions and Unity events will appear here.</EmptyLog>
              ) : (
                eventLog.map((entry, index) => (
                  <LogEntry key={index}>
                    <LogTime>{entry.time}</LogTime>
                    <LogEvent>{entry.event}</LogEvent>
                    {entry.data && (
                      <LogData>{JSON.stringify(entry.data, null, 2)}</LogData>
                    )}
                  </LogEntry>
                ))
              )}
              <div ref={logEndRef} />
            </LogContainer>
          </Section>

          <Section>
            <SectionTitle>Current State</SectionTitle>
            <StateContainer>
              <StateItem>
                <StateLabel>Fish 1:</StateLabel>
                <StateValue>
                  {unityContext.fish1 ? JSON.stringify(unityContext.fish1, null, 2) : "None"}
                </StateValue>
              </StateItem>
              <StateItem>
                <StateLabel>Fish 2:</StateLabel>
                <StateValue>
                  {unityContext.fish2 ? JSON.stringify(unityContext.fish2, null, 2) : "None"}
                </StateValue>
              </StateItem>
              <StateItem>
                <StateLabel>Fish 3:</StateLabel>
                <StateValue>
                  {unityContext.fish3 ? JSON.stringify(unityContext.fish3, null, 2) : "None"}
                </StateValue>
              </StateItem>
            </StateContainer>
          </Section>
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
  background: #1a1a1a;
  color: #fff;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 20px;
  background: #2a2a2a;
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

const StatusValue = styled.span<{ isActive: boolean }>`
  color: ${(props) => (props.isActive ? "#4caf50" : "#f44336")};
  font-weight: bold;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 20px;
  padding: 20px;
`;

const LeftPanel = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const RightPanel = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Section = styled.div`
  background: #2a2a2a;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #444;
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
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;

  &:hover {
    background: #45a049;
  }

  &:active {
    background: #3d8b40;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color: #aaa;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #4caf50;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  font-family: monospace;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #4caf50;
  }
`;

const LogContainer = styled.div`
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 15px;
  max-height: 500px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
`;

const EmptyLog = styled.div`
  color: #666;
  text-align: center;
  padding: 20px;
`;

const LogEntry = styled.div`
  margin-bottom: 10px;
  padding: 8px;
  background: #2a2a2a;
  border-radius: 4px;
  border-left: 3px solid #4caf50;
`;

const LogTime = styled.div`
  color: #888;
  font-size: 11px;
  margin-bottom: 4px;
`;

const LogEvent = styled.div`
  color: #4caf50;
  font-weight: bold;
  margin-bottom: 4px;
`;

const LogData = styled.pre`
  color: #aaa;
  margin: 8px 0 0 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 11px;
`;

const StateContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const StateItem = styled.div`
  background: #1a1a1a;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #444;
`;

const StateLabel = styled.div`
  color: #4caf50;
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 14px;
`;

const StateValue = styled.pre`
  color: #aaa;
  font-size: 11px;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
`;

export default UnityController;
