import { UnityContent } from "react-unity-webgl";
import { Fish } from "../utils/fish";
import { createContext, useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Fight } from "../utils/fight";

interface UnityProviderContext {
  UnityInstance: UnityContent;
  isUnityMounted: boolean;
  isLoaded: boolean;
  progression: number;
  isFishPoolReady: boolean;
  toggleIsUnityMounted: () => void;
  fishCaught: (fish: Fish) => void;
  showFishingLocation: () => void;
  showBreedingLocation: () => void;
  showOceanLocation: () => void;
  showFightingLocation: () => void;
	showFightingUI: () => void;
	showBreedingUI: () => void;
	showFishingUI: () => void;
	showFishUI: () => void;
  showHome: () => void;
  showTank: () => void;
  addFishOcean: (fish: Fish) => void;
  addFishTank: (fish: Fish) => void;
  addFishFightingPool: (fish: Fish) => void;
  addFishBreedingPool: (fish: Fish) => void;
  addFishFight1: (fish: Fish) => void;
  addFishFight2: (fish: Fish) => void;
  addFishBreed1: (fish: Fish) => void;
  addFishBreed2: (fish: Fish) => void;
  addBreedOffspring: (fish: Fish) => void;
  addFishFishing: (fish: Fish) => void;
  refreshFishUnity: (fish: Fish) => void;
  showFish: (fish: Fish) => void;
  clearFishPool: (pool: string) => void;
  sendRound: (round: number, roundStat: number) => void;
	clearUIFish: () => void;
	hideUI: () => void;
  startFight: () => void;
  sendFightResult: (fight: Fight, fish1: Fish, fish2: Fish) => void;
  sendTie: () => void;
  progressToNextRound: () => void;
  resetFightResults: () => void;
  currentFightRound: 1 | 2 | 3 | "final" | null;
}

enum Location {
  Ocean,
  Fishing,
  Fighting,
  Breeding
}

type UnityProviderProps = { children: React.ReactNode };

// Helper function to safely send messages to Unity
const safeUnitySend = (unityInstance: UnityContent, gameObject: string, method: string, message?: any) => {
  try {
    if (message !== undefined) {
      unityInstance.send(gameObject, method, message);
    } else {
      unityInstance.send(gameObject, method);
    }
  } catch (error) {
    console.warn("Unity send failed:", error, "Args:", [gameObject, method, message]);
  }
};

// Initiating context as undefined
const UnityContext = createContext<UnityProviderContext | undefined>(undefined);

// Defining context provider
export const UnityProvider = ({ children }: UnityProviderProps) => {
  // Use absolute paths for Unity files to ensure they load correctly regardless of route
  // Unity files are in public/Unity, so they're served at /Unity/...
  const basePath = "/";
  // FishFight instance initiates with default url provider upon visiting page
  const [UnityInstance, setUnityInstance] = useState<UnityContent>(
    new UnityContent(
      `${basePath}Unity/fishfight-one-frontend.json`,
      `${basePath}Unity/UnityLoader.js`
    )
  );
  const [isUnityMounted, setIsUnityMounted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fishPoolReady, setFishPoolReady] = useState(false);
  const [progression, setProgression] = useState(0);
  const [cookies, setCookie] = useCookies(["accepted_terms"]);
  const [currentLocation, setCurrentLocation] = useState(0);

  const [fish1, setFish1] = useState<Fish | undefined>(undefined);
  const [fish2, setFish2] = useState<Fish | undefined>(undefined);
  const [fish3, setFish3] = useState<Fish | undefined>(undefined);
  
  // State for manual round progression
  const [currentFightRound, setCurrentFightRound] = useState<1 | 2 | 3 | "final" | null>(null);
  const [currentFightData, setCurrentFightData] = useState<{ fight: Fight; fish1: Fish; fish2: Fish } | null>(null);

  useEffect(() => {
    // console.log(UnityInstance);
    UnityInstance.on("progress", setProgression);
    UnityInstance.on("loaded", function () {
      setIsLoaded(true);
    });
    UnityInstance.on("error", function (message: any) {
      // // console.log('An error!', message);
    });
    UnityInstance.on("log", function (message: any) {
      // console.log("A message!", message);
    });
    UnityInstance.on("canvas", function (element: any) {
      // // console.log('Canvas', element);
    });

    UnityInstance.on("CameraStartConfirm", function () {
      // console.log("CameraStartConfirmed!");
    });

    UnityInstance.on("CanvasUIStartConfirm", function () {
      // console.log("CanvasUIStartConfirm!");
    });
    UnityInstance.on("UISelectionConfirm", function (data: any) {
      // console.log("UI changed");
      // console.log(data);
      switch (data) {
        case "disclaimer_confirm":
          if (cookies["accepted_terms"] === true) return;
          setCookie("accepted_terms", true);
          return;
        case "fight_confirm":
          // EDD TODO
          return;
        case "breed_confirm":
          // EDD TODO
          return;
        default:
          return;
      }
    });
    UnityInstance.on("FishPoolStartConfirm", function () {
      setFishPoolReady(true);
      // console.log("FishPoolStartConfirmed!");
    });
    UnityInstance.on("SetAnimStateConfirm", function () {
      // console.log("SetAnimStateConfirm!");
    });
    UnityInstance.on("ClearPoolConfirm", function () {
      // console.log("ClearPoolConfirm!");
    });
    UnityInstance.on("AddFishConfirm", function () {
      // console.log("AddFishConfirm!");
    });
    UnityInstance.on("SetFishingStateConfirm", function () {
      // console.log("SetFishingStateConfirm!");
    });
    UnityInstance.on("SetFightStateConfirm", function () {
      // console.log("SetFightStateConfirm!");
    });
    UnityInstance.on("FishCaughtReceived", function () {
      // console.log("FishCaughtReceived");
    });
    UnityInstance.on("FishPoolFightRound1", function () {
      // console.log("Confirm FishPoolFightRound1");
    });
    UnityInstance.on("FishPoolFightRound2", function () {
      // console.log("Confirm FishPoolFightRound2");
    });
    UnityInstance.on("FishPoolFightRound3", function () {
      // console.log("Confirm FishPoolFightRound3");
    });
    UnityInstance.on('FishPoolFightWinner', function () {
      console.log('Confirm FishPoolFightWinner');
    });
    UnityInstance.on('FishPoolFightTie', function () {
      console.log('Confirm FishPoolFightTie');
    });
  }, []);

  const fishCaught = (fish: Fish) => {
    // // console.log("FishCaught Called")
    if (!isLoaded || !fishPoolReady) return;
    // console.log(JSON.stringify(fish));
    safeUnitySend(
      UnityInstance,
      "CanvasUserInterface",
      "FishCaught",
      JSON.stringify(fish)
    );
    // // console.log("FishCaught Completed")
  };
  const showFishingLocation = () => {
    // // console.log("showFishingLocation Called")
    if (!isLoaded || !fishPoolReady) return;
    setTimeout(() => {
      safeUnitySend(UnityInstance, "Camera", "SetAnimState", "ShowFishing");
      safeUnitySend(UnityInstance, "CanvasUserInterface", "SetAnimState", "ShowFishing");
      setCurrentLocation(Location.Fishing)
      // // console.log("showFishingLocation Completed")
    }, 100);
  };
  const showFightingLocation = () => {
    // // console.log("showFightingLocation Called")
    if (!isLoaded || !fishPoolReady) return;
    safeUnitySend(UnityInstance, "Camera", "SetAnimState", "ShowFighting");
    setCurrentLocation(Location.Fighting)
    // safeUnitySend(UnityInstance, "CanvasUserInterface", "SetAnimState", "ShowFighting");
    // // console.log("showFightingLocation Completed")
  };
  const showBreedingLocation = () => {
     // console.log("showBreedingLocation Called")
    if (!isLoaded || !fishPoolReady) return;
    safeUnitySend(UnityInstance, "Camera", "SetAnimState", "ShowBreeding");
    setCurrentLocation(Location.Breeding)
    // UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowBreeding");
    // // console.log("showFightingLocation Completed")
  };
  const showOceanLocation = () => {
    // // console.log("showOceanLocation Called")
    if (!isLoaded || !fishPoolReady) return;
    safeUnitySend(UnityInstance,"Camera", "SetAnimState", "ShowOcean");
    safeUnitySend(UnityInstance,"CanvasUserInterface", "SetAnimState", "ShowOcean");
    setCurrentLocation(Location.Ocean)
    // // console.log("showOceanLocation Completed")
  };
  const showHome = () => {
    // console.log("ShowHome Called");
    if (!isLoaded) return;
    safeUnitySend(UnityInstance,"Camera", "SetAnimState", "ShowHome");
    safeUnitySend(UnityInstance,"CanvasUserInterface", "SetAnimState", "ShowHome");
    // console.log("ShowHome Completed");
  };
  const showTank = () => {
    // console.log("ShowTank Called");
    if (!isLoaded) return;
    safeUnitySend(UnityInstance,"Camera", "SetAnimState", "ShowOcean");
    safeUnitySend(UnityInstance,"CanvasUserInterface", "SetAnimState", "ShowOcean");
    // console.log("ShowTank Completed");
  };

  const showFishUI = () => {
    // console.log("Show Fish UI Called");
    if (!isLoaded) return;
    //UnityInstance.send('Camera', 'SetUIState', 'ShowOcean'); // ShowFish ?
    safeUnitySend(UnityInstance,"CanvasUserInterface", "SetAnimState", "ShowFish"); // ShowFish ?
    // console.log("ShowFish Completed");
  };
	const showFishingUI = () => {
    // console.log("Show Fishing UI Called");
    if (!isLoaded) return;
    safeUnitySend(UnityInstance,"CanvasUserInterface", "SetAnimState", "ShowFishing");
    // console.log("ShowFishing Completed");
  };
  const showFightingUI = () => {
    // console.log("Show Fight UI Called");
    if (!isLoaded) return;
    //UnityInstance.send('Camera', 'SetUIState', 'ShowFighting');
    safeUnitySend(UnityInstance,"CanvasUserInterface", "SetAnimState", "ShowFighting");
  };
  const showBreedingUI = () => {
    // console.log("Show Breed UI Called");
    if (!isLoaded) return;
      safeUnitySend(UnityInstance,"CanvasUserInterface", "SetAnimState", "ShowBreeding");
    };


	const clearUIFish = () => {
    // // console.log("ClearFishPool Called " + pool)
    if (!isLoaded || !fishPoolReady) return;
    safeUnitySend(UnityInstance,"FishPool", "ClearUIFish");
    // // console.log("ClearFishPool Called " + pool)
  };

	const hideUI = () => {
		if (!isLoaded || !fishPoolReady) return;
		safeUnitySend(UnityInstance, "CanvasUserInterface", "SetAnimState", "Hide");
	}

  const clearFishPool = (pool: string) => {
    // // console.log("ClearFishPool Called " + pool)
    if (!isLoaded || !fishPoolReady) return;
    safeUnitySend(UnityInstance,"FishPool", "ClearPool", pool);
    // // console.log("ClearFishPool Called " + pool)
  };
  const addFishOcean = (fish: Fish) => {
    // console.log(`AddFish ${fish.tokenId}`);
    if (!isLoaded || !fishPoolReady) return;
    // // console.log(fish)
    setTimeout(() => {
      safeUnitySend(UnityInstance,"FishPool", "AddFish_OceanView", JSON.stringify(fish));
      // // console.log("AddFish Completed")
    }, 100);
  };
  const addFishTank = (fish: Fish) => {
    // console.log(`AddFish Tank${fish.tokenId}`);
    if (!isLoaded || !fishPoolReady) return;
    // // console.log(fish)
    setTimeout(() => {
      safeUnitySend(UnityInstance,"FishPool", "AddFish_TankView", JSON.stringify(fish));
      // // console.log("AddFish Completed")
    }, 100);
  };
  const addFishFightingPool = (fish: Fish) => {
    // // console.log("AddFish Called")
    if (!isLoaded || !fishPoolReady) return;
    // console.log(fish);
    setTimeout(() => {
      safeUnitySend(UnityInstance,
        "FishPool",
        "AddFish_FightingView",
        JSON.stringify(fish)
      );
      // // console.log("AddFish Completed")
    }, 100);
  };
  const addFishFight1 = (fish: Fish) => {
    // // console.log("AddFish Called")
    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    showFightingUI();
    safeUnitySend(UnityInstance,
      "FishPool",
      "AddFish1_FightingView",
      JSON.stringify(fish)
    );
    safeUnitySend(UnityInstance,
      "FishPool",
      "AddFish1_FishView",
      JSON.stringify(fish)
    );

    
    setTimeout(() => {
      safeUnitySend(UnityInstance,"CanvasUserInterface", "FightingUI_SetFish1", JSON.stringify(fish) ); // ShowFish ?
    }, 100);
    setFish1(fish);
  };

  const addFishFight2 = (fish: Fish) => {
    // // console.log("AddFish Called")
    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    showFightingUI();
    safeUnitySend(UnityInstance,
      "FishPool",
      "AddFish2_FightingView",
      JSON.stringify(fish)
    );
    safeUnitySend(UnityInstance,
      "FishPool",
      "AddFish2_FishView",
      JSON.stringify(fish)
    );

    
    setTimeout(() => {
      safeUnitySend(UnityInstance,"CanvasUserInterface", "FightingUI_SetFish2", JSON.stringify(fish) ); // ShowFish ?
    }, 100);
      
    setFish2(fish);
  };

  const sendFightResult = (fight: Fight, fish1: Fish, fish2: Fish) => {
    if (!isLoaded || !fishPoolReady) return;
    console.log("sendFightResult - Winner:", fight.winner);
    
    // Store fight data for manual progression
    setCurrentFightData({ fight, fish1, fish2 });
    setCurrentFightRound(1);
    
    // Send fight results data to FishPool
    safeUnitySend(UnityInstance,"FishPool", "SetFightResults", JSON.stringify(fight));
    
    // Show Round 1 UI - user will click button to progress
    setTimeout(() => {
      console.log("Showing Round 1 results UI");
      safeUnitySend(UnityInstance,"CanvasUserInterface", "SetAnimState", "ShowFightingResults1");
      
      // Set fish data for Round 1
      setTimeout(() => {
        safeUnitySend(UnityInstance,"CanvasUserInterface", "FightingResultsRound1UI_SetFish1", JSON.stringify(fish1));
        safeUnitySend(UnityInstance,"CanvasUserInterface", "FightingResultsRound1UI_SetFish2", JSON.stringify(fish2));
      }, 300);
    }, 300);
  };

  const progressToNextRound = () => {
    if (!isLoaded || !fishPoolReady || !currentFightData || !currentFightRound) return;
    
    const { fight, fish1, fish2 } = currentFightData;
    
    if (currentFightRound === 1) {
      // Progress to Round 2
      console.log("Progressing to Round 2");
      setCurrentFightRound(2);
      safeUnitySend(UnityInstance,"CanvasUserInterface", "SetAnimState", "ShowFightingResults2");
      
      setTimeout(() => {
        safeUnitySend(UnityInstance,"CanvasUserInterface", "FightingResultsRound2UI_SetFish1", JSON.stringify(fish1));
        safeUnitySend(UnityInstance,"CanvasUserInterface", "FightingResultsRound2UI_SetFish2", JSON.stringify(fish2));
      }, 300);
    } else if (currentFightRound === 2) {
      // Progress to Round 3
      console.log("Progressing to Round 3");
      setCurrentFightRound(3);
      safeUnitySend(UnityInstance,"CanvasUserInterface", "SetAnimState", "ShowFightingResults3");
      
      setTimeout(() => {
        safeUnitySend(UnityInstance,"CanvasUserInterface", "FightingResultsRound3UI_SetFish1", JSON.stringify(fish1));
        safeUnitySend(UnityInstance,"CanvasUserInterface", "FightingResultsRound3UI_SetFish2", JSON.stringify(fish2));
      }, 300);
    } else if (currentFightRound === 3) {
      // Progress to Final Results
      console.log("Progressing to Final Results");
      setCurrentFightRound("final");
      safeUnitySend(UnityInstance,"CanvasUserInterface", "SetAnimState", "ShowFightingResults");
      
      setTimeout(() => {
        safeUnitySend(UnityInstance,"CanvasUserInterface", "FightingResultsUI_SetFish1", JSON.stringify(fish1));
        safeUnitySend(UnityInstance,"CanvasUserInterface", "FightingResultsUI_SetFish2", JSON.stringify(fish2));
      }, 300);
    } else if (currentFightRound === "final") {
      // Close/reset - this will be handled by Unity's fightresults_confirm event
      console.log("Final results shown, waiting for Unity confirm");
    }
  };

  const resetFightResults = () => {
    setCurrentFightRound(null);
    setCurrentFightData(null);
  };

  const addFishBreedingPool = (fish: Fish) => {
    // // console.log("AddFish Called")
    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    setTimeout(() => {
      safeUnitySend(UnityInstance,
        "FishPool",
        "AddFish_BreedingView",
        JSON.stringify(fish)
      );
      // // console.log("AddFish Completed")
    }, 100);
  };
  const addFishBreed1 = (fish: Fish) => {
    // // console.log("AddFish Called")
    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    showBreedingUI();
    // UnityInstance.send(
    //   "FishPool",
    //   "AddFish1_BreedingView",
    //   JSON.stringify(fish)
    // );
    safeUnitySend(UnityInstance,
      "FishPool",
      "AddFish1_FishView",
      JSON.stringify(fish)
    );
    
    setTimeout(() => {
      safeUnitySend(UnityInstance,"CanvasUserInterface", "BreedingUI_SetFish1", JSON.stringify(fish) ); // ShowFish ?
    }, 100);
    setFish1(fish);
  };

  const addFishBreed2 = (fish: Fish) => {
    // // console.log("AddFish Called")
    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    showBreedingUI();
    // UnityInstance.send(
    //   "FishPool",
    //   "AddFish2_BreedingView",
    //   JSON.stringify(fish)
    // );
    safeUnitySend(UnityInstance,
      "FishPool",
      "AddFish2_FishView",
      JSON.stringify(fish)
    );
    
    setTimeout(() => {
      safeUnitySend(UnityInstance,"CanvasUserInterface", "BreedingUI_SetFish2", JSON.stringify(fish) ); // ShowFish ?
    }, 100);
    setFish2(fish);
  };

  const addBreedOffspring = (fish: Fish) => {
    safeUnitySend(UnityInstance,"CanvasUserInterface", "SetAnimState", "ShowBreedingResultsSuccess");
    setTimeout(() => {  
      safeUnitySend(UnityInstance,"CanvasUserInterface", "BreedingResultsUI_SetFish1", JSON.stringify(fish) );
    }, 100);

    if (fish.parentAFish && fish.parentBFish) {
      safeUnitySend(UnityInstance,"FishPool", "AddFish2_FishView", JSON.stringify(fish.parentAFish));
      safeUnitySend(UnityInstance,"FishPool", "AddFish3_FishView", JSON.stringify(fish.parentBFish));
    }
    safeUnitySend(UnityInstance,"FishPool", "AddFish1_FishView", JSON.stringify(fish));
    
    setFish1(fish);
  }

  const addFishFishing = (fish: Fish) => {
    // console.log("AddFish Called");
    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    safeUnitySend(UnityInstance,"FishPool", "AddFish_FishingView", JSON.stringify(fish));
    safeUnitySend(UnityInstance,"FishPool", "AddFish1_FishView", JSON.stringify(fish)); 
    safeUnitySend(UnityInstance,"CanvasUserInterface", "SetAnimState", "ShowFishingResultsSuccess"); // ShowFish ?

    setTimeout(() => {  
      safeUnitySend(UnityInstance,"CanvasUserInterface", "FishingResultsUI_SetFish1", JSON.stringify(fish) ); // ShowFish ?
    }, 100);

    // console.log("AddFish Completed");
  };

  const showFish = (fish: Fish) => {
    console.log(fish)
    if (!fishPoolReady) return;
    showFishUI()
    setTimeout(() => {  
      safeUnitySend(UnityInstance,"CanvasUserInterface", "FishUI_SetFish1", JSON.stringify(fish));
    }, 100);

    if (fish.parentAFish && fish.parentBFish) {
      safeUnitySend(UnityInstance,"FishPool", "AddFish2_FishView", JSON.stringify(fish.parentAFish));
      safeUnitySend(UnityInstance,"FishPool", "AddFish3_FishView", JSON.stringify(fish.parentBFish));
    }
    safeUnitySend(UnityInstance,"FishPool", "AddFish1_FishView", JSON.stringify(fish));
    setFish1(fish);
  };

  const sendRound = (round: number, roundStat: number) => {
    // console.log(roundStat);
    if (!isLoaded || !fishPoolReady) return;
    switch (round) {
      case 1:
        safeUnitySend(UnityInstance,"FishPool", "SetRound1Stat", roundStat);
        break;
      case 2:
        safeUnitySend(UnityInstance,"FishPool", "SetRound2Stat", roundStat);
        break;
      case 3:
        safeUnitySend(UnityInstance,"FishPool", "SetRound3Stat", roundStat);
        break;
      default:
        break;
    }
  };

  const startFight = () => {
    console.log("StartFight Called");
    if (!isLoaded || !fishPoolReady) {
      console.log("Unity not ready - isLoaded:", isLoaded, "fishPoolReady:", fishPoolReady);
      return;
    }
    // Based on Unity patterns, try these method names to start the fight animation
    // Unity might start automatically after rounds are set, or need explicit trigger
    safeUnitySend(UnityInstance,"FishPool", "StartFight");
    safeUnitySend(UnityInstance,"FishPool", "BeginFight");
    safeUnitySend(UnityInstance,"CanvasUserInterface", "FightingUI_StartFight");
    safeUnitySend(UnityInstance,"CanvasUserInterface", "StartFight");
    // Also try setting fight state explicitly
    safeUnitySend(UnityInstance,"FishPool", "SetFightState", "Start");
    console.log("StartFight Completed - sent multiple method calls");
  };

  const refreshFishUnity = (fish: Fish) => {
    if(fish1?.tokenId === fish.tokenId) {
      switch (currentLocation) {
        case Location.Ocean:
          showFish(fish);
          break;
        case Location.Fighting:
          addFishFight1(fish)
          break;
        case Location.Breeding:
          addFishBreed1(fish)
          break;
        default:
          break;
      }
    }
    if(fish2?.tokenId === fish.tokenId) {
      switch (currentLocation) {
        case Location.Ocean:
          showFish(fish);
          break;
        case Location.Fighting:
          addFishFight2(fish)
          break;
        case Location.Breeding:
          addFishBreed2(fish)
          break;
        default:
          break;
      }
    }
  }

  const sendTie = () => {
    // console.log("SetTie Called");
    safeUnitySend(UnityInstance,"FishPool", "SetTie");
    // console.log("SetTie Completed");
  };

  const toggleIsUnityMounted = () => {
    setIsUnityMounted(!isUnityMounted);
  };

  const value: UnityProviderContext = {
    UnityInstance: UnityInstance,
    isUnityMounted: isUnityMounted,
    isLoaded: isLoaded,
    progression: progression,
    isFishPoolReady: fishPoolReady,
    toggleIsUnityMounted: toggleIsUnityMounted,
    fishCaught: fishCaught,
    showFishingLocation: showFishingLocation,
    showBreedingLocation: showBreedingLocation,
    showOceanLocation: showOceanLocation,
    showFightingLocation: showFightingLocation,
		showFightingUI: showFightingUI,
		showBreedingUI: showBreedingUI,
		showFishingUI: showFishingUI,
		showFishUI: showFishUI,
    showHome: showHome,
    showTank: showTank,
    addFishOcean: addFishOcean,
    addFishTank: addFishTank,
    addFishFightingPool: addFishFightingPool,
    addFishBreedingPool: addFishBreedingPool,
    addFishFight1: addFishFight1,
    addFishFight2: addFishFight2,
    addFishBreed1: addFishBreed1,
    addFishBreed2: addFishBreed2,
    addBreedOffspring: addBreedOffspring,
    addFishFishing: addFishFishing,
    showFish: showFish,
    refreshFishUnity: refreshFishUnity,
    clearFishPool: clearFishPool,
		clearUIFish: clearUIFish,
		hideUI: hideUI,
    sendRound: sendRound,
    startFight: startFight,
    sendFightResult: sendFightResult,
    sendTie: sendTie,
    progressToNextRound: progressToNextRound,
    resetFightResults: resetFightResults,
    currentFightRound: currentFightRound,
  };
  return (
    <UnityContext.Provider value={value}>{children}</UnityContext.Provider>
  );
};

// useFishFight
export const useUnity = () => {
  const context = useContext(UnityContext);
  if (!context) {
    throw "useFishFight must be used within a FishFightProvider";
  }
  return context;
};
