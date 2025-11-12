// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useUnity } from '../context/unityContext';
import { useFishPool } from '../context/fishPoolContext';
import { Fish } from '../utils/fish';
import { Fight } from '../utils/fight';

const UnityController = () => {
  const unityContext = useUnity();
  const { userFish, fightingFish } = useFishPool();
  const [logs, setLogs] = useState<Array<{ time: string; message: string; type: 'info' | 'error' | 'success' }>>([]);
  const [fish1Json, setFish1Json] = useState<string>('');
  const [fish2Json, setFish2Json] = useState<string>('');
  const [fightJson, setFightJson] = useState<string>('');
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [roundStat, setRoundStat] = useState<number>(0);
  const [poolName, setPoolName] = useState<string>('Fighting');
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { time, message, type }]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const parseFish = (json: string): Fish | null => {
    try {
      const parsed = JSON.parse(json);
      // Create a minimal Fish object if needed
      return parsed as Fish;
    } catch (e) {
      addLog(`Error parsing Fish JSON: ${e}`, 'error');
      return null;
    }
  };

  const parseFight = (json: string): Fight | null => {
    try {
      const parsed = JSON.parse(json);
      return parsed as Fight;
    } catch (e) {
      addLog(`Error parsing Fight JSON: ${e}`, 'error');
      return null;
    }
  };

  const handleAction = (actionName: string, action: () => void) => {
    try {
      addLog(`Executing: ${actionName}`, 'info');
      action();
      addLog(`Success: ${actionName}`, 'success');
    } catch (e: any) {
      addLog(`Error in ${actionName}: ${e?.message || e}`, 'error');
    }
  };

  // Location Controls
  const locationControls = [
    { name: 'Show Fishing Location', action: () => unityContext.showFishingLocation() },
    { name: 'Show Breeding Location', action: () => unityContext.showBreedingLocation() },
    { name: 'Show Ocean Location', action: () => unityContext.showOceanLocation() },
    { name: 'Show Fighting Location', action: () => unityContext.showFightingLocation() },
    { name: 'Show Home', action: () => unityContext.showHome() },
    { name: 'Show Tank', action: () => unityContext.showTank() },
  ];

  // UI Controls
  const uiControls = [
    { name: 'Show Fighting UI', action: () => unityContext.showFightingUI() },
    { name: 'Show Breeding UI', action: () => unityContext.showBreedingUI() },
    { name: 'Show Fishing UI', action: () => unityContext.showFishingUI() },
    { name: 'Show Fish UI', action: () => unityContext.showFishUI() },
    { name: 'Hide UI', action: () => unityContext.hideUI() },
    { name: 'Clear UI Fish', action: () => unityContext.clearUIFish() },
  ];

  // Fish Controls
  const handleAddFishOcean = () => {
    const fish = parseFish(fish1Json);
    if (fish) unityContext.addFishOcean(fish);
  };

  const handleAddFishTank = () => {
    const fish = parseFish(fish1Json);
    if (fish) unityContext.addFishTank(fish);
  };

  const handleAddFishFightingPool = () => {
    const fish = parseFish(fish1Json);
    if (fish) unityContext.addFishFightingPool(fish);
  };

  const handleAddFishBreedingPool = () => {
    const fish = parseFish(fish1Json);
    if (fish) unityContext.addFishBreedingPool(fish);
  };

  const handleAddFishFight1 = () => {
    const fish = parseFish(fish1Json);
    if (fish) {
      addLog(`Adding Fish 1 to fight: TokenId ${fish.tokenId}`, 'info');
      unityContext.addFishFight1(fish);
    }
  };

  const handleAddFishFight2 = () => {
    const fish = parseFish(fish2Json);
    if (fish) {
      addLog(`Adding Fish 2 to fight: TokenId ${fish.tokenId}`, 'info');
      unityContext.addFishFight2(fish);
    }
  };

  const handleSendFightResult = () => {
    const fight = parseFight(fightJson);
    const fish1 = parseFish(fish1Json);
    const fish2 = parseFish(fish2Json);
    if (fight && fish1 && fish2) {
      addLog(`Sending fight result: Winner ${fight.winner}`, 'info');
      unityContext.sendFightResult(fight, fish1, fish2);
    }
  };

  const handleSendRound = () => {
    addLog(`Sending Round ${roundNumber} with stat ${roundStat}`, 'info');
    unityContext.sendRound(roundNumber, roundStat);
  };

  const handleSendTie = () => {
    addLog('Sending Tie', 'info');
    unityContext.sendTie();
  };

  const handleClearFishPool = () => {
    addLog(`Clearing pool: ${poolName}`, 'info');
    unityContext.clearFishPool(poolName);
  };

  const handleFishCaught = () => {
    const fish = parseFish(fish1Json);
    if (fish) unityContext.fishCaught(fish);
  };

  const handleShowFish = () => {
    const fish = parseFish(fish1Json);
    if (fish) unityContext.showFish(fish);
  };

  // Quick actions using real fish from context
  const quickFishActions = [
    {
      name: 'Use First User Fish as Fish 1',
      action: () => {
        if (userFish.length > 0) {
          const fish = userFish[0];
          setFish1Json(JSON.stringify(fish, null, 2));
          addLog(`Loaded User Fish ${fish.tokenId} as Fish 1`, 'success');
        } else {
          addLog('No user fish available', 'error');
        }
      },
    },
    {
      name: 'Use First Fighting Fish as Fish 2',
      action: () => {
        if (fightingFish.length > 0) {
          const fish = fightingFish[0];
          setFish2Json(JSON.stringify(fish, null, 2));
          addLog(`Loaded Fighting Fish ${fish.tokenId} as Fish 2`, 'success');
        } else {
          addLog('No fighting fish available', 'error');
        }
      },
    },
  ];

  // Sample fight data generator
  const generateSampleFight = () => {
    const fish1 = parseFish(fish1Json);
    const fish2 = parseFish(fish2Json);
    if (fish1 && fish2) {
      const sampleFight: Fight = {
        typeOfFight: 0,
        fishChallenger: fish1.tokenId,
        fishChallenged: fish2.tokenId,
        timeOfFight: Math.floor(Date.now() / 1000),
        round1: { value: 0, description: 'Strength' },
        round2: { value: 1, description: 'Intelligence' },
        round3: { value: 2, description: 'Agility' },
        winner: fish1.tokenId, // Change to fish2.tokenId or 0 for tie
        playerResult: 1,
      };
      setFightJson(JSON.stringify(sampleFight, null, 2));
      addLog('Generated sample fight data', 'success');
    } else {
      addLog('Please load Fish 1 and Fish 2 first', 'error');
    }
  };

  // Complete fighting animation sequence
  const runFightingSequence = async () => {
    const fish1 = parseFish(fish1Json);
    const fish2 = parseFish(fish2Json);
    const fight = parseFight(fightJson);

    if (!fish1 || !fish2) {
      addLog('Please load Fish 1 and Fish 2 first', 'error');
      return;
    }

    if (!fight) {
      addLog('Please load fight data first', 'error');
      return;
    }

    addLog('=== Starting Fighting Animation Sequence ===', 'info');
    
    // Step 1: Show fighting location
    addLog('Step 1: Showing fighting location...', 'info');
    unityContext.showFightingLocation();
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 2: Show fighting UI
    addLog('Step 2: Showing fighting UI...', 'info');
    unityContext.showFightingUI();
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 3: Add fish 1
    addLog('Step 3: Adding Fish 1...', 'info');
    unityContext.addFishFight1(fish1);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: Add fish 2
    addLog('Step 4: Adding Fish 2...', 'info');
    unityContext.addFishFight2(fish2);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 5: Send rounds
    addLog('Step 5: Sending rounds...', 'info');
    unityContext.sendRound(1, fight.round1.value);
    await new Promise(resolve => setTimeout(resolve, 2000));
    unityContext.sendRound(2, fight.round2.value);
    await new Promise(resolve => setTimeout(resolve, 2000));
    unityContext.sendRound(3, fight.round3.value);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 6: Send fight result
    addLog('Step 6: Sending fight result...', 'info');
    unityContext.sendFightResult(fight, fish1, fish2);
    await new Promise(resolve => setTimeout(resolve, 1000));

    addLog('=== Fighting Animation Sequence Complete ===', 'success');
  };

  return (
    <Container>
      <Header>
        <Title>Unity Context Controller</Title>
        <Subtitle>Debug and control Unity game context</Subtitle>
      </Header>

      <Content>
        <LeftPanel>
          <Section>
            <SectionTitle>Unity Status</SectionTitle>
            <StatusGrid>
              <StatusItem>
                <Label>Loaded:</Label>
                <Value status={unityContext.isLoaded}>{unityContext.isLoaded ? 'Yes' : 'No'}</Value>
              </StatusItem>
              <StatusItem>
                <Label>Fish Pool Ready:</Label>
                <Value status={unityContext.isFishPoolReady}>{unityContext.isFishPoolReady ? 'Yes' : 'No'}</Value>
              </StatusItem>
              <StatusItem>
                <Label>Mounted:</Label>
                <Value status={unityContext.isUnityMounted}>{unityContext.isUnityMounted ? 'Yes' : 'No'}</Value>
              </StatusItem>
              <StatusItem>
                <Label>Progress:</Label>
                <Value>{(unityContext.progression * 100).toFixed(1)}%</Value>
              </StatusItem>
            </StatusGrid>
            <Button onClick={() => unityContext.toggleIsUnityMounted()}>
              Toggle Unity Mount
            </Button>
          </Section>

          <Section>
            <SectionTitle>Location Controls</SectionTitle>
            <ButtonGrid>
              {locationControls.map((control, idx) => (
                <Button key={idx} onClick={() => handleAction(control.name, control.action)}>
                  {control.name}
                </Button>
              ))}
            </ButtonGrid>
          </Section>

          <Section>
            <SectionTitle>UI Controls</SectionTitle>
            <ButtonGrid>
              {uiControls.map((control, idx) => (
                <Button key={idx} onClick={() => handleAction(control.name, control.action)}>
                  {control.name}
                </Button>
              ))}
            </ButtonGrid>
          </Section>

          <Section>
            <SectionTitle>Pool Controls</SectionTitle>
            <InputGroup>
              <Label>Pool Name:</Label>
              <Input
                type="text"
                value={poolName}
                onChange={(e) => setPoolName(e.target.value)}
                placeholder="Fighting, Breeding, etc."
              />
            </InputGroup>
            <Button onClick={() => handleAction('Clear Fish Pool', handleClearFishPool)}>
              Clear Fish Pool
            </Button>
          </Section>

          <Section>
            <SectionTitle>Quick Actions</SectionTitle>
            <ButtonGrid>
              {quickFishActions.map((action, idx) => (
                <Button key={idx} onClick={action.action}>
                  {action.name}
                </Button>
              ))}
            </ButtonGrid>
          </Section>
        </LeftPanel>

        <RightPanel>
          <Section>
            <SectionTitle>Fighting Animation Debug</SectionTitle>
            <FightingSection>
              <SubSection>
                <SubSectionTitle>Fish 1 (JSON)</SubSectionTitle>
                <TextArea
                  value={fish1Json}
                  onChange={(e) => setFish1Json(e.target.value)}
                  placeholder="Paste Fish 1 JSON here..."
                  rows={8}
                />
                <Button onClick={handleAddFishFight1}>Add Fish 1 to Fight</Button>
              </SubSection>

              <SubSection>
                <SubSectionTitle>Fish 2 (JSON)</SubSectionTitle>
                <TextArea
                  value={fish2Json}
                  onChange={(e) => setFish2Json(e.target.value)}
                  placeholder="Paste Fish 2 JSON here..."
                  rows={8}
                />
                <Button onClick={handleAddFishFight2}>Add Fish 2 to Fight</Button>
              </SubSection>

              <SubSection>
                <SubSectionTitle>Fight Result (JSON)</SubSectionTitle>
                <TextArea
                  value={fightJson}
                  onChange={(e) => setFightJson(e.target.value)}
                  placeholder="Paste Fight JSON here..."
                  rows={8}
                />
                <Button onClick={generateSampleFight}>Generate Sample Fight</Button>
                <Button onClick={handleSendFightResult}>Send Fight Result</Button>
              </SubSection>

              <SubSection>
                <SubSectionTitle>Round Controls</SubSectionTitle>
                <InputGroup>
                  <Label>Round Number (1-3):</Label>
                  <Input
                    type="number"
                    min="1"
                    max="3"
                    value={roundNumber}
                    onChange={(e) => setRoundNumber(parseInt(e.target.value) || 1)}
                  />
                </InputGroup>
                <InputGroup>
                  <Label>Round Stat (0=Strength, 1=Intelligence, 2=Agility):</Label>
                  <Input
                    type="number"
                    min="0"
                    max="2"
                    value={roundStat}
                    onChange={(e) => setRoundStat(parseInt(e.target.value) || 0)}
                  />
                </InputGroup>
                <Button onClick={handleSendRound}>Send Round</Button>
                <Button onClick={handleSendTie}>Send Tie</Button>
              </SubSection>

              <SubSection>
                <SubSectionTitle>Complete Fighting Sequence</SubSectionTitle>
                <Button primary onClick={runFightingSequence}>
                  Run Complete Fighting Animation Sequence
                </Button>
                <HelpText>
                  This will execute the full fighting animation sequence:
                  1. Show fighting location
                  2. Show fighting UI
                  3. Add Fish 1
                  4. Add Fish 2
                  5. Send all 3 rounds
                  6. Send fight result
                </HelpText>
              </SubSection>
            </FightingSection>
          </Section>

          <Section>
            <SectionTitle>Other Fish Actions</SectionTitle>
            <ButtonGrid>
              <Button onClick={handleAddFishOcean}>Add Fish to Ocean</Button>
              <Button onClick={handleAddFishTank}>Add Fish to Tank</Button>
              <Button onClick={handleAddFishFightingPool}>Add Fish to Fighting Pool</Button>
              <Button onClick={handleAddFishBreedingPool}>Add Fish to Breeding Pool</Button>
              <Button onClick={handleFishCaught}>Fish Caught</Button>
              <Button onClick={handleShowFish}>Show Fish</Button>
            </ButtonGrid>
          </Section>

          <Section>
            <SectionTitle>Action Logs</SectionTitle>
            <LogContainer>
              {logs.map((log, idx) => (
                <LogEntry key={idx} type={log.type}>
                  <LogTime>[{log.time}]</LogTime>
                  <LogMessage>{log.message}</LogMessage>
                </LogEntry>
              ))}
              <div ref={logsEndRef} />
            </LogContainer>
            <Button onClick={() => setLogs([])}>Clear Logs</Button>
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
  margin: 0;
  font-size: 24px;
  color: #fff;
`;

const Subtitle = styled.p`
  margin: 5px 0 0 0;
  font-size: 14px;
  color: #aaa;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 20px;
  padding: 20px;
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
  overflow-y: auto;
  gap: 20px;
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  gap: 20px;
`;

const Section = styled.div`
  background: #2a2a2a;
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #444;
`;

const SectionTitle = styled.h2`
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #fff;
  border-bottom: 1px solid #444;
  padding-bottom: 10px;
`;

const SubSection = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  background: #1f1f1f;
  border-radius: 6px;
  border: 1px solid #333;
`;

const SubSectionTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #ccc;
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 15px;
`;

const StatusItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 12px;
  color: #aaa;
  margin-bottom: 5px;
`;

const Value = styled.span<{ status?: boolean }>`
  font-size: 14px;
  font-weight: bold;
  color: ${props => {
    if (props.status === undefined) return '#fff';
    return props.status ? '#4caf50' : '#f44336';
  }};
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 10px 15px;
  background: ${props => props.primary ? '#4caf50' : '#444'};
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;

  &:hover {
    background: ${props => props.primary ? '#45a049' : '#555'};
  }

  &:active {
    background: ${props => props.primary ? '#3d8b40' : '#666'};
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
`;

const Input = styled.input`
  padding: 8px;
  background: #1a1a1a;
  color: #fff;
  border: 1px solid #444;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #4caf50;
  }
`;

const TextArea = styled.textarea`
  padding: 8px;
  background: #1a1a1a;
  color: #fff;
  border: 1px solid #444;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  width: 100%;
  resize: vertical;
  margin-bottom: 10px;

  &:focus {
    outline: none;
    border-color: #4caf50;
  }
`;

const FightingSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const HelpText = styled.p`
  margin: 10px 0 0 0;
  font-size: 12px;
  color: #aaa;
  font-style: italic;
`;

const LogContainer = styled.div`
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 10px;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 10px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
`;

const LogEntry = styled.div<{ type: 'info' | 'error' | 'success' }>`
  display: flex;
  gap: 10px;
  margin-bottom: 5px;
  color: ${props => {
    switch (props.type) {
      case 'error': return '#f44336';
      case 'success': return '#4caf50';
      default: return '#fff';
    }
  }};
`;

const LogTime = styled.span`
  color: #888;
  flex-shrink: 0;
`;

const LogMessage = styled.span`
  flex: 1;
`;

export default UnityController;
