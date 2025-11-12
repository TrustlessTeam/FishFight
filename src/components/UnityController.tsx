// @ts-nocheck
import { useState, useEffect, useRef, Fragment } from "react";
import styled from "styled-components";
import { useUnity } from "../context/unityContext";
import { Fish } from "../utils/fish";
import { Fight } from "../utils/fight";
import Unity from "react-unity-webgl";

const UnityController = () => {
  const unityContext = useUnity();
  const [logs, setLogs] = useState<Array<{ time: string; type: string; message: string }>>([]);
  const [mockFish1, setMockFish1] = useState<string>("");
  const [mockFish2, setMockFish2] = useState<string>("");
  const [mockFight, setMockFight] = useState<string>("");
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [roundStat, setRoundStat] = useState<number>(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (type: string, message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { time, type, message }]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Set up Unity event listeners for logging
  useEffect(() => {
    if (!unityContext.UnityInstance) return;

    const eventHandlers = [
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
      "FishPoolFightWinner",
      "FishPoolFightTie",
    ];

    eventHandlers.forEach((eventName) => {
      unityContext.UnityInstance.on(eventName, function (data: any) {
        addLog("event", `${eventName}: ${JSON.stringify(data)}`);
      });
    });

    return () => {
      // Cleanup listeners if needed
    };
  }, [unityContext.UnityInstance]);

  const createMockFish = (tokenId: number): any => {
    // Generate a proper genes string (128 hex chars = 64 bytes)
    const genesArray = Array.from({ length: 128 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const genes = "0x" + genesArray;
    
    // Parse genes array for visual traits
    const genesArrayParsed = [];
    for (let j = 0; j < 128; j++) {
      genesArrayParsed.push(parseInt(genes.slice(2 + (j * 2), 4 + (j * 2)), 16));
    }
    
    // Create basic visual traits structure
    const createColor = (r: number, g: number, b: number) => ({ r, g, b, a: 255 });
    const visualTraits = {
      ColorBodyPrimary: createColor(genesArrayParsed[6] || 100, genesArrayParsed[7] || 150, genesArrayParsed[8] || 200),
      ColorBodySecondary: createColor(genesArrayParsed[9] || 120, genesArrayParsed[10] || 160, genesArrayParsed[11] || 210),
      ColorBodyTertiary: createColor(genesArrayParsed[12] || 110, genesArrayParsed[13] || 155, genesArrayParsed[14] || 205),
      ColorHeadPrimary: createColor(genesArrayParsed[15] || 100, genesArrayParsed[16] || 150, genesArrayParsed[17] || 200),
      ColorHeadSecondary: createColor(genesArrayParsed[18] || 120, genesArrayParsed[19] || 160, genesArrayParsed[20] || 210),
      ColorHeadTertiary: createColor(genesArrayParsed[21] || 110, genesArrayParsed[22] || 155, genesArrayParsed[23] || 205),
      ColorTailPrimary: createColor(genesArrayParsed[24] || 100, genesArrayParsed[25] || 150, genesArrayParsed[26] || 200),
      ColorTailSecondary: createColor(genesArrayParsed[27] || 120, genesArrayParsed[28] || 160, genesArrayParsed[29] || 210),
      ColorTailTertiary: createColor(genesArrayParsed[30] || 110, genesArrayParsed[31] || 155, genesArrayParsed[32] || 205),
      ColorPectoralPrimary: createColor(genesArrayParsed[33] || 100, genesArrayParsed[34] || 150, genesArrayParsed[35] || 200),
      ColorPectoralSecondary: createColor(genesArrayParsed[36] || 120, genesArrayParsed[37] || 160, genesArrayParsed[38] || 210),
      ColorPectoralTertiary: createColor(genesArrayParsed[39] || 110, genesArrayParsed[40] || 155, genesArrayParsed[41] || 205),
      ColorDorsalPrimary: createColor(genesArrayParsed[42] || 100, genesArrayParsed[43] || 150, genesArrayParsed[44] || 200),
      ColorDorsalSecondary: createColor(genesArrayParsed[45] || 120, genesArrayParsed[46] || 160, genesArrayParsed[47] || 210),
      ColorDorsalTertiary: createColor(genesArrayParsed[48] || 110, genesArrayParsed[49] || 155, genesArrayParsed[50] || 205),
      ColorJawPrimary: createColor(genesArrayParsed[51] || 100, genesArrayParsed[52] || 150, genesArrayParsed[53] || 200),
      ColorJawSecondary: createColor(genesArrayParsed[54] || 120, genesArrayParsed[55] || 160, genesArrayParsed[56] || 210),
      ColorJawTertiary: createColor(genesArrayParsed[57] || 110, genesArrayParsed[58] || 155, genesArrayParsed[59] || 205),
      ColorEyePrimary: createColor(genesArrayParsed[60] || 100, genesArrayParsed[61] || 150, genesArrayParsed[62] || 200),
      ColorEyeSecondary: createColor(genesArrayParsed[63] || 120, genesArrayParsed[64] || 160, genesArrayParsed[65] || 210),
      ColorEyeTertiary: createColor(genesArrayParsed[66] || 110, genesArrayParsed[67] || 155, genesArrayParsed[68] || 205),
      HeadEdges: genesArrayParsed[69] || 0,
      HeadNose: genesArrayParsed[70] || 0,
      HeadFrills: genesArrayParsed[71] || 0,
      HeadFlat: genesArrayParsed[72] || 0,
      HeadSplit: genesArrayParsed[73] || 0,
      HeadFlatnose: genesArrayParsed[74] || 0,
      BodyFat: genesArrayParsed[75] || 0,
      TextureBodyPrimary: genesArrayParsed[76] || 0,
      TextureBodySecondary: genesArrayParsed[77] || 0,
      TextureHeadPrimary: genesArrayParsed[78] || 0,
      TextureHeadSecondary: genesArrayParsed[79] || 0,
      TexturePectoralPrimary: genesArrayParsed[80] || 0,
      TexturePectoralSecondary: genesArrayParsed[81] || 0,
      TextureDorsalPrimary: genesArrayParsed[82] || 0,
      TextureDorsalSecondary: genesArrayParsed[83] || 0,
      TextureTailPrimary: genesArrayParsed[84] || 0,
      TextureTailSecondary: genesArrayParsed[85] || 0,
      TextureJawPrimary: genesArrayParsed[86] || 0,
      TextureJawSecondary: genesArrayParsed[87] || 0,
      MeshBodyIndex: genesArrayParsed[88] || 0,
      MeshJawIndex: genesArrayParsed[89] || 0,
      MeshEyeIndex: genesArrayParsed[90] || 0,
      MeshDorsalIndex: genesArrayParsed[91] || 0,
      MeshPectoralIndex: genesArrayParsed[92] || 0,
      MeshTailIndex: genesArrayParsed[93] || 0,
      GlimmerStrength: genesArrayParsed[94] || 0,
    };
    
    return {
      tokenId,
      birthTime: Math.floor(Date.now() / 1000),
      genes,
      fishType: 1,
      rarity: 1,
      generation: 1,
      strength: Math.floor(Math.random() * 100),
      intelligence: Math.floor(Math.random() * 100),
      agility: Math.floor(Math.random() * 100),
      power: Math.floor(Math.random() * 100),
      lifetimeWins: 0,
      parentA: 0,
      parentAFish: null,
      parentB: 0,
      parentBFish: null,
      breedKey: "",
      deathTime: 0,
      revived: false,
      genesArray: genesArrayParsed,
      visualTraits,
      imgSrc: null,
      ipfsLink: null,
      modifiers: [],
      offspringHistory: null,
      fightingHistory: null,
      stakedFighting: null,
      stakedBreeding: null,
      isUser: false,
      canQuest: true,
      fishModifiers: {
        alphaModifier: { time: 0, value: 0, uses: 0, name: "" },
        bettaModifier: { time: 0, value: 0, uses: 0, name: "" },
        collectModifier: { time: 0, value: 0, uses: 0, name: "" },
        feedModifier: { time: 0, value: 0, uses: 0, name: "" },
        strModifier: { time: 0, value: 0, uses: 0, name: "" },
        intModifier: { time: 0, value: 0, uses: 0, name: "" },
        agiModifier: { time: 0, value: 0, uses: 0, name: "" },
        powerModifier: { time: 0, value: 0, uses: 0, name: "" },
        canFeed: false,
        canCollect: false,
        inBettaCooldown: false,
      },
    };
  };

  const createMockFight = (fish1: any, fish2: any): Fight => {
    return {
      typeOfFight: 0,
      fishChallenger: fish1.tokenId,
      fishChallenged: fish2.tokenId,
      timeOfFight: Math.floor(Date.now() / 1000),
      round1: { value: 0, description: "Strength" },
      round2: { value: 1, description: "Intelligence" },
      round3: { value: 2, description: "Agility" },
      winner: fish1.tokenId,
      playerResult: 1,
    };
  };

  const handleAction = (action: string, ...args: any[]) => {
    try {
      addLog("action", `Calling: ${action}(${args.map((a) => JSON.stringify(a)).join(", ")})`);
      
      switch (action) {
        case "showFishingLocation":
          unityContext.showFishingLocation();
          break;
        case "showBreedingLocation":
          unityContext.showBreedingLocation();
          break;
        case "showOceanLocation":
          unityContext.showOceanLocation();
          break;
        case "showFightingLocation":
          unityContext.showFightingLocation();
          break;
        case "showFightingUI":
          unityContext.showFightingUI();
          break;
        case "showBreedingUI":
          unityContext.showBreedingUI();
          break;
        case "showFishingUI":
          unityContext.showFishingUI();
          break;
        case "showFishUI":
          unityContext.showFishUI();
          break;
        case "showHome":
          unityContext.showHome();
          break;
        case "showTank":
          unityContext.showTank();
          break;
        case "hideUI":
          unityContext.hideUI();
          break;
        case "clearUIFish":
          unityContext.clearUIFish();
          break;
        case "clearFishPool":
          unityContext.clearFishPool(args[0] || "Fighting");
          break;
        case "addFishOcean":
          if (mockFish1) {
            const fish = JSON.parse(mockFish1);
            unityContext.addFishOcean(fish);
          } else {
            const fish = createMockFish(1);
            unityContext.addFishOcean(fish);
          }
          break;
        case "addFishTank":
          if (mockFish1) {
            const fish = JSON.parse(mockFish1);
            unityContext.addFishTank(fish);
          } else {
            const fish = createMockFish(1);
            unityContext.addFishTank(fish);
          }
          break;
        case "addFishFightingPool":
          if (mockFish1) {
            const fish = JSON.parse(mockFish1);
            unityContext.addFishFightingPool(fish);
          } else {
            const fish = createMockFish(1);
            unityContext.addFishFightingPool(fish);
          }
          break;
        case "addFishBreedingPool":
          if (mockFish1) {
            const fish = JSON.parse(mockFish1);
            unityContext.addFishBreedingPool(fish);
          } else {
            const fish = createMockFish(1);
            unityContext.addFishBreedingPool(fish);
          }
          break;
        case "addFishFight1":
          if (mockFish1) {
            const fish = JSON.parse(mockFish1);
            unityContext.addFishFight1(fish);
          } else {
            const fish = createMockFish(1);
            unityContext.addFishFight1(fish);
          }
          break;
        case "addFishFight2":
          if (mockFish2) {
            const fish = JSON.parse(mockFish2);
            unityContext.addFishFight2(fish);
          } else {
            const fish = createMockFish(2);
            unityContext.addFishFight2(fish);
          }
          break;
        case "sendRound":
          unityContext.sendRound(roundNumber, roundStat);
          break;
        case "startFight":
          unityContext.startFight();
          break;
        case "sendFightResult":
          let fight: Fight;
          let fish1: Fish;
          let fish2: Fish;
          
          if (mockFight) {
            fight = JSON.parse(mockFight);
          } else {
            fish1 = mockFish1 ? JSON.parse(mockFish1) : createMockFish(1);
            fish2 = mockFish2 ? JSON.parse(mockFish2) : createMockFish(2);
            fight = createMockFight(fish1, fish2);
          }
          
          if (!fish1) fish1 = mockFish1 ? JSON.parse(mockFish1) : createMockFish(1);
          if (!fish2) fish2 = mockFish2 ? JSON.parse(mockFish2) : createMockFish(2);
          
          unityContext.sendFightResult(fight, fish1, fish2);
          break;
        case "sendTie":
          unityContext.sendTie();
          break;
        case "fishCaught":
          if (mockFish1) {
            const fish = JSON.parse(mockFish1);
            unityContext.fishCaught(fish);
          } else {
            const fish = createMockFish(1);
            unityContext.fishCaught(fish);
          }
          break;
        case "toggleUnityMounted":
          unityContext.toggleIsUnityMounted();
          break;
        case "testFightSequence":
          // Complete fight sequence test
          const testFish1 = mockFish1 ? JSON.parse(mockFish1) : createMockFish(1);
          const testFish2 = mockFish2 ? JSON.parse(mockFish2) : createMockFish(2);
          const testFight = createMockFight(testFish1, testFish2);
          
          addLog("action", "Starting fight sequence test...");
          addLog("action", `Fight rounds: R1=${testFight.round1.description}, R2=${testFight.round2.description}, R3=${testFight.round3.description}`);
          addLog("action", "NOTE: Watch for Unity events: FishPoolFightRound1/2/3, FishPoolFightWinner/Tie");
          
          unityContext.showFightingLocation();
          setTimeout(() => {
            unityContext.showFightingUI();
            addLog("action", "Fighting UI shown");
            setTimeout(() => {
              unityContext.addFishFight1(testFish1);
              addLog("action", "Fish 1 added");
              setTimeout(() => {
                unityContext.addFishFight2(testFish2);
                addLog("action", "Fish 2 added");
                setTimeout(() => {
                  // Send all round stats BEFORE starting the fight
                  unityContext.sendRound(1, testFight.round1.value); // Round 1
                  addLog("action", `Round 1 stat sent: ${testFight.round1.value} (${testFight.round1.description})`);
                  setTimeout(() => {
                    unityContext.sendRound(2, testFight.round2.value); // Round 2
                    addLog("action", `Round 2 stat sent: ${testFight.round2.value} (${testFight.round2.description})`);
                    setTimeout(() => {
                      unityContext.sendRound(3, testFight.round3.value); // Round 3
                      addLog("action", `Round 3 stat sent: ${testFight.round3.value} (${testFight.round3.description})`);
                      setTimeout(() => {
                        // Now start the fight animation
                        unityContext.startFight();
                        addLog("action", "Fight start command sent - Unity should animate rounds now");
                        addLog("action", "Waiting for Unity callbacks: FishPoolFightRound1/2/3, then FishPoolFightWinner/Tie");
                        // Wait for Unity to complete the fight animation via callbacks
                        // In production, we'd listen for FishPoolFightWinner/Tie events
                        setTimeout(() => {
                          unityContext.sendFightResult(testFight, testFish1, testFish2);
                          addLog("action", `Fight results sent - Winner: Fish ${testFight.winner}`);
                          addLog("action", "Fight sequence test completed");
                        }, 5000); // Give Unity time to animate all 3 rounds
                      }, 500); // Give Unity time to process rounds before starting
                    }, 300);
                  }, 300);
                }, 500);
              }, 500);
            }, 500);
          }, 500);
          break;
        case "step1_hideUI":
          addLog("action", "Step 1: Hiding UI");
          unityContext.hideUI();
          break;
        case "step2_showFightingLocation":
          addLog("action", "Step 2: Showing Fighting Location");
          unityContext.showFightingLocation();
          break;
        case "step3_showFightingUI":
          addLog("action", "Step 3: Showing Fighting UI");
          unityContext.showFightingUI();
          break;
        case "step4_addFish1":
          addLog("action", "Step 4: Adding Fish 1");
          const stepFish1 = mockFish1 ? JSON.parse(mockFish1) : createMockFish(1);
          unityContext.addFishFight1(stepFish1);
          break;
        case "step5_addFish2":
          addLog("action", "Step 5: Adding Fish 2");
          const stepFish2 = mockFish2 ? JSON.parse(mockFish2) : createMockFish(2);
          unityContext.addFishFight2(stepFish2);
          break;
        case "step6_sendFightResults":
          addLog("action", "Step 6: Sending Fight Results");
          const stepFight = mockFight ? JSON.parse(mockFight) : createMockFight(
            mockFish1 ? JSON.parse(mockFish1) : createMockFish(1),
            mockFish2 ? JSON.parse(mockFish2) : createMockFish(2)
          );
          if (unityContext.UnityInstance) {
            unityContext.UnityInstance.send("FishPool", "SetFightResults", JSON.stringify(stepFight));
          }
          break;
        case "step7_hideBeforeResults":
          addLog("action", "Step 7: Hiding UI before showing results");
          unityContext.hideUI();
          break;
        case "step8_showFightingResults":
          addLog("action", "Step 8: Showing Fighting Results UI");
          if (unityContext.UnityInstance) {
            unityContext.UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFightingResults");
          }
          break;
        case "step9_setFishData":
          addLog("action", "Step 9: Setting Fish Data in Results");
          const finalFish1 = mockFish1 ? JSON.parse(mockFish1) : createMockFish(1);
          const finalFish2 = mockFish2 ? JSON.parse(mockFish2) : createMockFish(2);
          if (unityContext.UnityInstance) {
            unityContext.UnityInstance.send("CanvasUserInterface", "FightingResultsUI_SetFish1", JSON.stringify(finalFish1));
            unityContext.UnityInstance.send("CanvasUserInterface", "FightingResultsUI_SetFish2", JSON.stringify(finalFish2));
          }
          break;
        case "stepThroughAll":
          addLog("action", "Starting automatic step-through...");
          const autoFish1 = mockFish1 ? JSON.parse(mockFish1) : createMockFish(1);
          const autoFish2 = mockFish2 ? JSON.parse(mockFish2) : createMockFish(2);
          const autoFight = createMockFight(autoFish1, autoFish2);
          
          // Step 1
          addLog("action", "Step 1: Hide UI");
          unityContext.hideUI();
          setTimeout(() => {
            // Step 2
            addLog("action", "Step 2: Show Fighting Location");
            unityContext.showFightingLocation();
            setTimeout(() => {
              // Step 3
              addLog("action", "Step 3: Show Fighting UI");
              unityContext.showFightingUI();
              setTimeout(() => {
                // Step 4
                addLog("action", "Step 4: Add Fish 1");
                unityContext.addFishFight1(autoFish1);
                setTimeout(() => {
                  // Step 5
                  addLog("action", "Step 5: Add Fish 2");
                  unityContext.addFishFight2(autoFish2);
                  setTimeout(() => {
                    // Step 6
                    addLog("action", "Step 6: Send Fight Results");
                    if (unityContext.UnityInstance) {
                      unityContext.UnityInstance.send("FishPool", "SetFightResults", JSON.stringify(autoFight));
                    }
                    setTimeout(() => {
                      // Step 7
                      addLog("action", "Step 7: Hide UI before showing results");
                      unityContext.hideUI();
                      setTimeout(() => {
                        // Step 8
                        addLog("action", "Step 8: Show Fighting Results UI");
                        if (unityContext.UnityInstance) {
                          unityContext.UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFightingResults");
                        }
                        setTimeout(() => {
                          // Step 9
                          addLog("action", "Step 9: Set Fish Data in Results");
                          if (unityContext.UnityInstance) {
                            unityContext.UnityInstance.send("CanvasUserInterface", "FightingResultsUI_SetFish1", JSON.stringify(autoFish1));
                            unityContext.UnityInstance.send("CanvasUserInterface", "FightingResultsUI_SetFish2", JSON.stringify(autoFish2));
                          }
                          addLog("action", "Complete - Results UI should be visible");
                        }, 300);
                      }, 300);
                    }, 500);
                  }, 500);
                }, 300);
              }, 300);
            }, 300);
          }, 300);
          break;
        default:
          addLog("error", `Unknown action: ${action}`);
      }
    } catch (error: any) {
      addLog("error", `Error in ${action}: ${error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <Container>
      <UnityWindowComponent>
        {!unityContext.isLoaded && (
          <LoadingText>
            Approaching Genesis Landing {unityContext.progression * 100} ...
          </LoadingText>
        )}
        <Fragment>
          {unityContext.isUnityMounted === true && (
            <Unity unityContent={unityContext.UnityInstance} />
          )}
        </Fragment>
      </UnityWindowComponent>
      <ControllerPanel>
        <Header>Unity Controller</Header>
        
        <Section>
          <SectionTitle>Unity State</SectionTitle>
          <StateGrid>
            <StateItem>
              <Label>Loaded:</Label>
              <Value className={unityContext.isLoaded ? "success" : "error"}>
                {unityContext.isLoaded ? "Yes" : "No"}
              </Value>
            </StateItem>
            <StateItem>
              <Label>Fish Pool Ready:</Label>
              <Value className={unityContext.isFishPoolReady ? "success" : "error"}>
                {unityContext.isFishPoolReady ? "Yes" : "No"}
              </Value>
            </StateItem>
            <StateItem>
              <Label>Unity Mounted:</Label>
              <Value className={unityContext.isUnityMounted ? "success" : "error"}>
                {unityContext.isUnityMounted ? "Yes" : "No"}
              </Value>
            </StateItem>
            <StateItem>
              <Label>Progression:</Label>
              <Value>{(unityContext.progression * 100).toFixed(1)}%</Value>
            </StateItem>
          </StateGrid>
        </Section>

        <Section>
          <SectionTitle>Location Controls</SectionTitle>
          <ButtonGrid>
            <Button onClick={() => handleAction("showFishingLocation")}>Show Fishing</Button>
            <Button onClick={() => handleAction("showBreedingLocation")}>Show Breeding</Button>
            <Button onClick={() => handleAction("showOceanLocation")}>Show Ocean</Button>
            <Button onClick={() => handleAction("showFightingLocation")}>Show Fighting</Button>
            <Button onClick={() => handleAction("showHome")}>Show Home</Button>
            <Button onClick={() => handleAction("showTank")}>Show Tank</Button>
          </ButtonGrid>
        </Section>

        <Section>
          <SectionTitle>UI Controls</SectionTitle>
          <ButtonGrid>
            <Button onClick={() => handleAction("showFightingUI")}>Show Fighting UI</Button>
            <Button onClick={() => handleAction("showBreedingUI")}>Show Breeding UI</Button>
            <Button onClick={() => handleAction("showFishingUI")}>Show Fishing UI</Button>
            <Button onClick={() => handleAction("showFishUI")}>Show Fish UI</Button>
            <Button onClick={() => handleAction("hideUI")}>Hide UI</Button>
            <Button onClick={() => handleAction("clearUIFish")}>Clear UI Fish</Button>
          </ButtonGrid>
        </Section>

        <Section>
          <SectionTitle>Fish Pool Controls</SectionTitle>
          <ButtonGrid>
            <Button onClick={() => handleAction("addFishOcean")}>Add Fish Ocean</Button>
            <Button onClick={() => handleAction("addFishTank")}>Add Fish Tank</Button>
            <Button onClick={() => handleAction("addFishFightingPool")}>Add Fish Fighting Pool</Button>
            <Button onClick={() => handleAction("addFishBreedingPool")}>Add Fish Breeding Pool</Button>
            <Button onClick={() => handleAction("clearFishPool", "Fighting")}>Clear Fighting Pool</Button>
            <Button onClick={() => handleAction("clearFishPool", "Breeding")}>Clear Breeding Pool</Button>
          </ButtonGrid>
        </Section>

        <Section>
          <SectionTitle>Fight Controls</SectionTitle>
          <ButtonGrid>
            <Button onClick={() => handleAction("addFishFight1")}>Add Fish Fight 1</Button>
            <Button onClick={() => handleAction("addFishFight2")}>Add Fish Fight 2</Button>
            <Button onClick={() => handleAction("sendRound")}>Send Round ({roundNumber}, {roundStat})</Button>
            <Button onClick={() => handleAction("startFight")}>Start Fight</Button>
            <Button onClick={() => handleAction("sendFightResult")}>Send Fight Result</Button>
            <Button onClick={() => handleAction("sendTie")}>Send Tie</Button>
            <Button className="test-button" onClick={() => handleAction("testFightSequence")}>
              Test Full Fight Sequence
            </Button>
          </ButtonGrid>
        </Section>

        <Section>
          <SectionTitle>Step Through Fighting UI (Debug)</SectionTitle>
          <ButtonGrid>
            <Button onClick={() => handleAction("step1_hideUI")}>Step 1: Hide UI</Button>
            <Button onClick={() => handleAction("step2_showFightingLocation")}>Step 2: Show Fighting Location</Button>
            <Button onClick={() => handleAction("step3_showFightingUI")}>Step 3: Show Fighting UI</Button>
            <Button onClick={() => handleAction("step4_addFish1")}>Step 4: Add Fish 1</Button>
            <Button onClick={() => handleAction("step5_addFish2")}>Step 5: Add Fish 2</Button>
            <Button onClick={() => handleAction("step6_sendFightResults")}>Step 6: Send Fight Results</Button>
            <Button onClick={() => handleAction("step7_hideBeforeResults")}>Step 7: Hide Before Results</Button>
            <Button onClick={() => handleAction("step8_showFightingResults")}>Step 8: Show Fighting Results</Button>
            <Button onClick={() => handleAction("step9_setFishData")}>Step 9: Set Fish Data</Button>
            <Button className="test-button" onClick={() => handleAction("stepThroughAll")}>
              Step Through All (Auto)
            </Button>
          </ButtonGrid>
          <InputGroup>
            <Input
              type="number"
              placeholder="Round Number (1-3)"
              value={roundNumber}
              onChange={(e) => setRoundNumber(parseInt(e.target.value) || 1)}
              min={1}
              max={3}
            />
            <Input
              type="number"
              placeholder="Round Stat (0-2)"
              value={roundStat}
              onChange={(e) => setRoundStat(parseInt(e.target.value) || 0)}
              min={0}
              max={2}
            />
          </InputGroup>
        </Section>

        <Section>
          <SectionTitle>Mock Data</SectionTitle>
          <TextArea
            placeholder="Mock Fish 1 JSON (optional)"
            value={mockFish1}
            onChange={(e) => setMockFish1(e.target.value)}
            rows={3}
          />
          <TextArea
            placeholder="Mock Fish 2 JSON (optional)"
            value={mockFish2}
            onChange={(e) => setMockFish2(e.target.value)}
            rows={3}
          />
          <TextArea
            placeholder="Mock Fight JSON (optional)"
            value={mockFight}
            onChange={(e) => setMockFight(e.target.value)}
            rows={3}
          />
          <Button onClick={() => {
            const fish = createMockFish(1);
            setMockFish1(JSON.stringify(fish, null, 2));
          }}>
            Generate Mock Fish 1
          </Button>
          <Button onClick={() => {
            const fish = createMockFish(2);
            setMockFish2(JSON.stringify(fish, null, 2));
          }}>
            Generate Mock Fish 2
          </Button>
          <Button onClick={() => {
            const fish1 = mockFish1 ? JSON.parse(mockFish1) : createMockFish(1);
            const fish2 = mockFish2 ? JSON.parse(mockFish2) : createMockFish(2);
            const fight = createMockFight(fish1, fish2);
            setMockFight(JSON.stringify(fight, null, 2));
          }}>
            Generate Mock Fight
          </Button>
        </Section>

        <Section>
          <SectionTitle>Other Controls</SectionTitle>
          <ButtonGrid>
            <Button onClick={() => handleAction("fishCaught")}>Fish Caught</Button>
            <Button onClick={() => handleAction("toggleUnityMounted")}>Toggle Unity Mounted</Button>
          </ButtonGrid>
        </Section>

        <Section>
          <SectionTitle>
            Event Logs
            <ClearButton onClick={clearLogs}>Clear</ClearButton>
          </SectionTitle>
          <LogContainer>
            {logs.map((log, index) => (
              <LogEntry key={index} className={log.type}>
                <LogTime>[{log.time}]</LogTime>
                <LogMessage>{log.message}</LogMessage>
              </LogEntry>
            ))}
            <div ref={logsEndRef} />
          </LogContainer>
        </Section>
      </ControllerPanel>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  position: relative;
`;

const UnityWindowComponent = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  & > div {
    background: none !important;
  }
`;

const LoadingText = styled.p`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 24px;
  z-index: 10;
`;

const ControllerPanel = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 400px;
  max-width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  overflow-y: auto;
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
`;

const Header = styled.h1`
  color: white;
  margin: 0 0 20px 0;
  font-size: 24px;
  border-bottom: 2px solid #038ec5;
  padding-bottom: 10px;
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  color: #038ec5;
  font-size: 18px;
  margin: 0 0 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StateGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const StateItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.span`
  font-size: 12px;
  color: #aaa;
  margin-bottom: 4px;
`;

const Value = styled.span`
  font-size: 14px;
  font-weight: bold;
  
  &.success {
    color: #4caf50;
  }
  
  &.error {
    color: #f44336;
  }
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const Button = styled.button`
  padding: 8px 12px;
  background: #038ec5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
  
  &:hover {
    background: #0277a3;
  }
  
  &.test-button {
    grid-column: 1 / -1;
    background: #4caf50;
    
    &:hover {
      background: #45a049;
    }
  }
`;

const InputGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid #555;
  border-radius: 4px;
  background: #222;
  color: white;
  font-size: 12px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #555;
  border-radius: 4px;
  background: #222;
  color: white;
  font-size: 11px;
  font-family: monospace;
  margin-bottom: 8px;
  resize: vertical;
`;

const LogContainer = styled.div`
  background: #111;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 10px;
  max-height: 300px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 11px;
`;

const LogEntry = styled.div`
  margin-bottom: 4px;
  display: flex;
  gap: 8px;
  
  &.action {
    color: #4caf50;
  }
  
  &.event {
    color: #2196f3;
  }
  
  &.error {
    color: #f44336;
  }
`;

const LogTime = styled.span`
  color: #888;
  min-width: 80px;
`;

const LogMessage = styled.span`
  flex: 1;
  word-break: break-all;
`;

const ClearButton = styled.button`
  padding: 4px 8px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background: #d32f2f;
  }
`;

export default UnityController;
