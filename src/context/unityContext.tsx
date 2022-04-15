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
  if (pathsCount == 3) {
    basePath = "..";
  }
  // FishFight instance initiates with default url provider upon visiting page
  const [UnityInstance, setUnityInstance] = useState<UnityContent>(
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
  const [fish3, setFish3] = useState<Fish | undefined>(undefined);

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
    // UnityInstance.on('FishPoolFightWinner', function () {
    // 	// console.log('Confirm FishPoolFightWinner');
    // });
    // UnityInstance.on('FishPoolFightTie', function () {
    // 	// console.log('Confirm FishPoolFightTie');
    // });
  }, []);

  const fishCaught = (fish: Fish) => {
    // // console.log("FishCaught Called")
    if (!isLoaded || !fishPoolReady) return;
    // console.log(JSON.stringify(fish));
    UnityInstance.send(
      "CanvasUserInterface",
      "FishCaught",
      JSON.stringify(fish)
    );
    // // console.log("FishCaught Completed")
  };
  const showFishingLocation = () => {
    // // console.log("showFishingLocation Called")
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send("Camera", "SetAnimState", "ShowFishing");
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFishing");
    setCurrentLocation(Location.Fishing)
    // // console.log("showFishingLocation Completed")
  };
  const showFightingLocation = () => {
    // // console.log("showFightingLocation Called")
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send("Camera", "SetAnimState", "ShowFighting");
    setCurrentLocation(Location.Fighting)
    // UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFighting");
    // // console.log("showFightingLocation Completed")
  };
  const showBreedingLocation = () => {
     // console.log("showBreedingLocation Called")
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send("Camera", "SetAnimState", "ShowBreeding");
    setCurrentLocation(Location.Breeding)
    // UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowBreeding");
    // // console.log("showFightingLocation Completed")
  };
  const showOceanLocation = () => {
    // // console.log("showOceanLocation Called")
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send("Camera", "SetAnimState", "ShowOcean");
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowOcean");
    setCurrentLocation(Location.Ocean)
    // // console.log("showOceanLocation Completed")
  };
  const showHome = () => {
    // console.log("ShowHome Called");
    if (!isLoaded) return;
    UnityInstance.send("Camera", "SetAnimState", "ShowHome");
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowHome");
    // console.log("ShowHome Completed");
  };
  const showTank = () => {
    // console.log("ShowTank Called");
    if (!isLoaded) return;
    UnityInstance.send("Camera", "SetAnimState", "ShowOcean");
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowOcean");
    // console.log("ShowTank Completed");
  };

  const showFishUI = () => {
    // console.log("Show Fish UI Called");
    if (!isLoaded) return;
    //UnityInstance.send('Camera', 'SetUIState', 'ShowOcean'); // ShowFish ?
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFish"); // ShowFish ?
    // console.log("ShowFish Completed");
  };
	const showFishingUI = () => {
    // console.log("Show Fishing UI Called");
    if (!isLoaded) return;
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFishing");
    // console.log("ShowFishing Completed");
  };
  const showFightingUI = () => {
    // console.log("Show Fight UI Called");
    if (!isLoaded) return;
    //UnityInstance.send('Camera', 'SetUIState', 'ShowFighting');
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFighting");
  };
  const showBreedingUI = () => {
    // console.log("Show Breed UI Called");
    if (!isLoaded) return;
      UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowBreeding");
    };

	const clearUIFish = () => {
    // // console.log("ClearFishPool Called " + pool)
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send("FishPool", "ClearUIFish");
    // // console.log("ClearFishPool Called " + pool)
  };

	const hideUI = () => {
		if (!isLoaded || !fishPoolReady) return;
		UnityInstance.send("CanvasUserInterface", "SetAnimState", "Hide");
	}

  const clearFishPool = (pool: string) => {
    // // console.log("ClearFishPool Called " + pool)
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send("FishPool", "ClearPool", pool);
    // // console.log("ClearFishPool Called " + pool)
  };
  const addFishOcean = (fish: Fish) => {
    // console.log(`AddFish ${fish.tokenId}`);
    if (!isLoaded || !fishPoolReady) return;
    // // console.log(fish)
    UnityInstance.send("FishPool", "AddFish_OceanView", JSON.stringify(fish));
    // // console.log("AddFish Completed")
  };
  const addFishTank = (fish: Fish) => {
    // console.log(`AddFish Tank${fish.tokenId}`);
    if (!isLoaded || !fishPoolReady) return;
    // // console.log(fish)
    UnityInstance.send("FishPool", "AddFish_TankView", JSON.stringify(fish));
    // // console.log("AddFish Completed")
  };
  const addFishFightingPool = (fish: Fish) => {
    // // console.log("AddFish Called")
    if (!isLoaded || !fishPoolReady) return;
    // console.log(fish);
    UnityInstance.send(
      "FishPool",
      "AddFish_FightingView",
      JSON.stringify(fish)
    );
    // // console.log("AddFish Completed")
  };
  const addFishFight1 = (fish: Fish) => {
    // // console.log("AddFish Called")
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
      UnityInstance.send("CanvasUserInterface", "FightingUI_SetFish1", JSON.stringify(fish) ); // ShowFish ?
    }, 100);
    setFish1(fish);
  };

  const addFishFight2 = (fish: Fish) => {
    // // console.log("AddFish Called")
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
      UnityInstance.send("CanvasUserInterface", "FightingUI_SetFish2", JSON.stringify(fish) ); // ShowFish ?
    }, 100);
      
    setFish2(fish);
  };

  const sendFightResult = (fight: Fight, fish1: Fish, fish2: Fish) => {
    // console.log("SendFight Called");
    console.log(fight)
    UnityInstance.send("FishPool", "SetFightResults", JSON.stringify(fight));
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFightResultsSuccess");
    
    //console.log( JSON.stringify(fish1));
    //console.log( JSON.stringify(fish2));

    setTimeout(() => {
      UnityInstance.send("CanvasUserInterface", "FightingResultsUI_SetFish1", JSON.stringify(fish1) ); 
      UnityInstance.send("CanvasUserInterface", "FightingResultsUI_SetFish2", JSON.stringify(fish2) ); 
    }, 100);
  };

  const addFishBreedingPool = (fish: Fish) => {
    // // console.log("AddFish Called")
    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    UnityInstance.send(
      "FishPool",
      "AddFish_BreedingView",
      JSON.stringify(fish)
    );
    // // console.log("AddFish Completed")
  };
  const addFishBreed1 = (fish: Fish) => {
    // // console.log("AddFish Called")
    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    showBreedingUI();
    UnityInstance.send(
      "FishPool",
      "AddFish1_BreedingView",
      JSON.stringify(fish)
    );
    UnityInstance.send(
      "FishPool",
      "AddFish1_FishView",
      JSON.stringify(fish)
    );
    
    setTimeout(() => {
      UnityInstance.send("CanvasUserInterface", "BreedingUI_SetFish1", JSON.stringify(fish) ); // ShowFish ?
    }, 100);
    setFish1(fish);
  };

  const addFishBreed2 = (fish: Fish) => {
    // // console.log("AddFish Called")
    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    showBreedingUI();
    UnityInstance.send(
      "FishPool",
      "AddFish2_BreedingView",
      JSON.stringify(fish)
    );
    UnityInstance.send(
      "FishPool",
      "AddFish2_FishView",
      JSON.stringify(fish)
    );
    
    setTimeout(() => {
      UnityInstance.send("CanvasUserInterface", "BreedingUI_SetFish2", JSON.stringify(fish) ); // ShowFish ?
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
    // console.log("AddFish Called");
    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    UnityInstance.send("FishPool", "AddFish_FishingView", JSON.stringify(fish));
    UnityInstance.send("FishPool", "AddFish1_FishView", JSON.stringify(fish)); 
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFishingResultsSuccess"); // ShowFish ?

    setTimeout(() => {  
      UnityInstance.send("CanvasUserInterface", "FishingResultsUI_SetFish1", JSON.stringify(fish) ); // ShowFish ?
    }, 100);

    // console.log("AddFish Completed");
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
    // console.log(roundStat);
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
    // console.log("SetTie Called");
    UnityInstance.send("FishPool", "SetTie");
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
    throw "useFishFight must be used within a FishFightProvider";
  }
  return context;
};
