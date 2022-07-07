/* eslint-disable react-hooks/exhaustive-deps */
import { UnityContent } from "react-unity-webgl";
import { Fish } from "../utils/fish";
import { createContext, useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useLocation } from "react-router-dom";
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
  sendFightResult: (fight: Fight, fish1: Fish, fish2: Fish) => void;
  sendTie: () => void;
}

enum Location {
  Ocean,
  Fishing,
  Fighting,
  Breeding
}

type UnityProviderProps = { children: React.ReactNode };

// Initiating context as undefined
const UnityContext = createContext<UnityProviderContext | undefined>(undefined);

// Defining context provider
export const UnityProvider = ({ children }: UnityProviderProps) => {
  const pathsCount = useLocation().pathname.split("/").length;
  let basePath = ".";
  if (pathsCount === 3) {
    basePath = "..";
  }
  // FishFight instance initiates with default url provider upon visiting page
  const [UnityInstance] = useState<UnityContent>(
    new UnityContent(
      `${basePath}/Unity/fishfight-one-frontend.json`,
      `${basePath}/Unity/UnityLoader.js`
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

  useEffect(() => {
    UnityInstance.on("progress", setProgression);

    UnityInstance.on("loaded", function () {
      setIsLoaded(true);
    });

    UnityInstance.on("error", function (message: any) {
      
    });

    UnityInstance.on("log", function (message: any) {
      
    });

    UnityInstance.on("canvas", function (element: any) {
      
    });

    UnityInstance.on("CameraStartConfirm", function () {
      
    });

    UnityInstance.on("CanvasUIStartConfirm", function () {
      
    });

    UnityInstance.on("UISelectionConfirm", function (data: any) {
      switch (data) {
        case "disclaimer_confirm":
          if (cookies["accepted_terms"] === true) return;
          setCookie("accepted_terms", true);
          return;
        case "fight_confirm":
          return;
        case "breed_confirm":
          return;
        default:
          return;
      }
    });

    UnityInstance.on("FishPoolStartConfirm", function () {
      setFishPoolReady(true);
    });

    UnityInstance.on("SetAnimStateConfirm", function () {
    });

    UnityInstance.on("ClearPoolConfirm", function () {
    });

    UnityInstance.on("AddFishConfirm", function () {
    });

    UnityInstance.on("SetFishingStateConfirm", function () {
    });

    UnityInstance.on("SetFightStateConfirm", function () {
    });

    UnityInstance.on("FishCaughtReceived", function () { 
    });

    UnityInstance.on("FishPoolFightRound1", function () {
    });

    UnityInstance.on("FishPoolFightRound2", function () {
    });

    UnityInstance.on("FishPoolFightRound3", function () {
    });

  }, []);

  const fishCaught = (fish: Fish) => {
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send(
      "CanvasUserInterface",
      "FishCaught",
      JSON.stringify(fish)
    );
  };

  const showFishingLocation = () => {
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send("Camera", "SetAnimState", "ShowFishing");
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFishing");
    setCurrentLocation(Location.Fishing)
  };

  const showFightingLocation = () => {
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send("Camera", "SetAnimState", "ShowFighting");
    setCurrentLocation(Location.Fighting)
  };

  const showBreedingLocation = () => {
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send("Camera", "SetAnimState", "ShowBreeding");
    setCurrentLocation(Location.Breeding)
  };

  const showOceanLocation = () => {
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send("Camera", "SetAnimState", "ShowOcean");
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowOcean");
    setCurrentLocation(Location.Ocean)
  };

  const showHome = () => {
    if (!isLoaded) return;
    UnityInstance.send("Camera", "SetAnimState", "ShowHome");
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowHome");
  };

  const showTank = () => {
    if (!isLoaded) return;
    UnityInstance.send("Camera", "SetAnimState", "ShowOcean");
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowOcean");
  };

  const showFishUI = () => {
    if (!isLoaded) return;
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFish");
  };

	const showFishingUI = () => {
    if (!isLoaded) return;
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFishing");
  };

  const showFightingUI = () => {
    if (!isLoaded) return;
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFighting");
  };

  const showBreedingUI = () => {
    if (!isLoaded) return;
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowBreeding");
  };

	const clearUIFish = () => {
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send("FishPool", "ClearUIFish");
  };

	const hideUI = () => {
		if (!isLoaded || !fishPoolReady) return;
		UnityInstance.send("CanvasUserInterface", "SetAnimState", "Hide");
	}

  const clearFishPool = (pool: string) => {
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send("FishPool", "ClearPool", pool);
  };

  const addFishOcean = (fish: Fish) => {
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send("FishPool", "AddFish_OceanView", JSON.stringify(fish));
  };

  const addFishTank = (fish: Fish) => {
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send("FishPool", "AddFish_TankView", JSON.stringify(fish));
  };

  const addFishFightingPool = (fish: Fish) => {
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send(
      "FishPool",
      "AddFish_FightingView",
      JSON.stringify(fish)
    );
  };

  const addFishFight1 = (fish: Fish) => {
    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    showFightingUI();
    UnityInstance.send(
      "FishPool",
      "AddFish1_FightingView",
      JSON.stringify(fish)
    );
    UnityInstance.send(
      "FishPool",
      "AddFish1_FishView",
      JSON.stringify(fish)
    );

    setTimeout(() => {
      UnityInstance.send("CanvasUserInterface", "FightingUI_SetFish1", JSON.stringify(fish) );
    }, 100);
    setFish1(fish);
  };

  const addFishFight2 = (fish: Fish) => {
    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    showFightingUI();
    UnityInstance.send(
      "FishPool",
      "AddFish2_FightingView",
      JSON.stringify(fish)
    );
    UnityInstance.send(
      "FishPool",
      "AddFish2_FishView",
      JSON.stringify(fish)
    );

    setTimeout(() => {
      UnityInstance.send("CanvasUserInterface", "FightingUI_SetFish2", JSON.stringify(fish) );
    }, 100);
      
    setFish2(fish);
  };

  const sendFightResult = (fight: Fight, fish1: Fish, fish2: Fish) => {
    console.log(fight)
    UnityInstance.send("FishPool", "SetFightResults", JSON.stringify(fight));
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFightResultsSuccess");

    setTimeout(() => {
      UnityInstance.send("CanvasUserInterface", "FightingResultsUI_SetFish1", JSON.stringify(fish1) ); 
      UnityInstance.send("CanvasUserInterface", "FightingResultsUI_SetFish2", JSON.stringify(fish2) ); 
    }, 100);
  };

  const addFishBreedingPool = (fish: Fish) => {
    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    UnityInstance.send(
      "FishPool",
      "AddFish_BreedingView",
      JSON.stringify(fish)
    );
  };
  const addFishBreed1 = (fish: Fish) => {
    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    showBreedingUI();
    UnityInstance.send(
      "FishPool",
      "AddFish1_FishView",
      JSON.stringify(fish)
    );
    
    setTimeout(() => {
      UnityInstance.send("CanvasUserInterface", "BreedingUI_SetFish1", JSON.stringify(fish) );
    }, 100);
    setFish1(fish);
  };

  const addFishBreed2 = (fish: Fish) => {

    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    showBreedingUI();
    UnityInstance.send(
      "FishPool",
      "AddFish2_FishView",
      JSON.stringify(fish)
    );
    
    setTimeout(() => {
      UnityInstance.send("CanvasUserInterface", "BreedingUI_SetFish2", JSON.stringify(fish) );
    }, 100);
    setFish2(fish);
  };

  const addBreedOffspring = (fish: Fish) => {
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowBreedingResultsSuccess");
    setTimeout(() => {  
      UnityInstance.send("CanvasUserInterface", "BreedingResultsUI_SetFish1", JSON.stringify(fish) );
    }, 100);

    if (fish.parentAFish && fish.parentBFish) {
      UnityInstance.send("FishPool", "AddFish2_FishView", JSON.stringify(fish.parentAFish));
      UnityInstance.send("FishPool", "AddFish3_FishView", JSON.stringify(fish.parentBFish));
    }
    UnityInstance.send("FishPool", "AddFish1_FishView", JSON.stringify(fish));
    
    setFish1(fish);
  }

  const addFishFishing = (fish: Fish) => {

    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    UnityInstance.send("FishPool", "AddFish_FishingView", JSON.stringify(fish));
    UnityInstance.send("FishPool", "AddFish1_FishView", JSON.stringify(fish)); 
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFishingResultsSuccess");

    setTimeout(() => {  
      UnityInstance.send("CanvasUserInterface", "FishingResultsUI_SetFish1", JSON.stringify(fish) );
    }, 100);
  };

  const showFish = (fish: Fish) => {
    console.log(fish)
    if (!fishPoolReady) return;
    showFishUI()
    setTimeout(() => {  
      UnityInstance.send("CanvasUserInterface", "FishUI_SetFish1", JSON.stringify(fish));
    }, 100);

    if (fish.parentAFish && fish.parentBFish) {
      UnityInstance.send("FishPool", "AddFish2_FishView", JSON.stringify(fish.parentAFish));
      UnityInstance.send("FishPool", "AddFish3_FishView", JSON.stringify(fish.parentBFish));
    }
    UnityInstance.send("FishPool", "AddFish1_FishView", JSON.stringify(fish));
    setFish1(fish);
  };

  const sendRound = (round: number, roundStat: number) => {
    switch (round) {
      case 1:
        UnityInstance.send("FishPool", "SetRound1Stat", roundStat);
        break;
      case 2:
        UnityInstance.send("FishPool", "SetRound2Stat", roundStat);
        break;
      case 3:
        UnityInstance.send("FishPool", "SetRound3Stat", roundStat);
        break;
      default:
        break;
    }
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
    UnityInstance.send("FishPool", "SetTie");
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
    sendFightResult: sendFightResult,
    sendTie: sendTie,
  };
  return (
    <UnityContext.Provider value={value}>{children}</UnityContext.Provider>
  );
};

// useFishFight
export const useUnity = () => {
  const context = useContext(UnityContext);
  if (!context) {
    // eslint-disable-next-line no-throw-literal
    throw "useFishFight must be used within a FishFightProvider";
  }
  return context;
};
