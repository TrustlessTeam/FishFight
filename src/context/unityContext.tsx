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
  mintFish: number;
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
  addFish1: (fish: Fish) => void;
  addFish2: (fish: Fish) => void;
  addFish3: (fish: Fish) => void;
  addFishFight1: (fish: Fish) => void;
  addFishFight2: (fish: Fish) => void;
  addFishBreed1: (fish: Fish) => void;
  addFishBreed2: (fish: Fish) => void;
  addFishFishing: (fish: Fish) => void;
  showFish: (fish: Fish) => void;
  clearFishPool: (pool: string) => void;
  sendRound: (round: number, roundStat: number) => void;
	clearUIFish: () => void;
	hideUI: () => void;
  sendFightResult: (fight: Fight) => void;
  sendTie: () => void;
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
  const [mintFish, setMintFish] = useState(0);
  const [cookies, setCookie] = useCookies(["accepted_terms"]);

  useEffect(() => {
    console.log(UnityInstance);
    UnityInstance.on("progress", setProgression);
    UnityInstance.on("loaded", function () {
      setIsLoaded(true);
    });
    UnityInstance.on("error", function (message: any) {
      // console.log('An error!', message);
    });
    UnityInstance.on("log", function (message: any) {
      console.log("A message!", message);
    });
    UnityInstance.on("canvas", function (element: any) {
      // console.log('Canvas', element);
    });

    UnityInstance.on("CameraStartConfirm", function () {
      console.log("CameraStartConfirmed!");
    });

    UnityInstance.on("CanvasUIStartConfirm", function () {
      console.log("CanvasUIStartConfirm!");
    });
    UnityInstance.on("UISelectionConfirm", function (data: any) {
      console.log("UI changed");
      console.log(data);
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
      console.log("FishPoolStartConfirmed!");
    });
    UnityInstance.on("SetAnimStateConfirm", function () {
      console.log("SetAnimStateConfirm!");
    });
    UnityInstance.on("ClearPoolConfirm", function () {
      console.log("ClearPoolConfirm!");
    });
    UnityInstance.on("AddFishConfirm", function () {
      console.log("AddFishConfirm!");
    });
    UnityInstance.on("SetFishingStateConfirm", function () {
      console.log("SetFishingStateConfirm!");
    });
    UnityInstance.on("SetFightStateConfirm", function () {
      console.log("SetFightStateConfirm!");
    });
    UnityInstance.on("FishCaughtReceived", function () {
      console.log("FishCaughtReceived");
    });
    UnityInstance.on("FishPoolFightRound1", function () {
      console.log("Confirm FishPoolFightRound1");
    });
    UnityInstance.on("FishPoolFightRound2", function () {
      console.log("Confirm FishPoolFightRound2");
    });
    UnityInstance.on("FishPoolFightRound3", function () {
      console.log("Confirm FishPoolFightRound3");
    });
    // UnityInstance.on('FishPoolFightWinner', function () {
    // 	console.log('Confirm FishPoolFightWinner');
    // });
    // UnityInstance.on('FishPoolFightTie', function () {
    // 	console.log('Confirm FishPoolFightTie');
    // });
  }, []);

  const fishCaught = (fish: Fish) => {
    // console.log("FishCaught Called")
    if (!isLoaded || !fishPoolReady) return;
    console.log(JSON.stringify(fish));
    UnityInstance.send(
      "CanvasUserInterface",
      "FishCaught",
      JSON.stringify(fish)
    );
    // console.log("FishCaught Completed")
  };
  const showFishingLocation = () => {
    // console.log("showFishingLocation Called")
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send("Camera", "SetAnimState", "ShowFishing");
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFishing");
    // console.log("showFishingLocation Completed")
  };
  const showFightingLocation = () => {
    // console.log("showFightingLocation Called")
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send("Camera", "SetAnimState", "ShowFighting");
    // UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFighting");
    // console.log("showFightingLocation Completed")
  };
  const showBreedingLocation = () => {
     console.log("showBreedingLocation Called")
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send("Camera", "SetAnimState", "ShowBreeding");
    // UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowBreeding");
    // console.log("showFightingLocation Completed")
  };
  const showOceanLocation = () => {
    // console.log("showOceanLocation Called")
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send("Camera", "SetAnimState", "ShowOcean");
    // UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowOcean");
    // console.log("showOceanLocation Completed")
  };
  const showHome = () => {
    console.log("ShowHome Called");
    if (!isLoaded) return;
    UnityInstance.send("Camera", "SetAnimState", "ShowHome");
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowHome");
    console.log("ShowHome Completed");
  };
  const showTank = () => {
    console.log("ShowTank Called");
    if (!isLoaded) return;
    UnityInstance.send("Camera", "SetAnimState", "ShowOcean");
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowOcean");
    console.log("ShowTank Completed");
  };

  const showFishUI = () => {
    console.log("Show Fish UI Called");
    if (!isLoaded) return;
    //UnityInstance.send('Camera', 'SetUIState', 'ShowOcean'); // ShowFish ?
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFish"); // ShowFish ?
    console.log("ShowFish Completed");
  };
	const showFishingUI = () => {
    console.log("Show Fishing UI Called");
    if (!isLoaded) return;
    //UnityInstance.send('Camera', 'SetUIState', 'ShowOcean'); // ShowFish ?
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFishing"); // ShowFish ?
    console.log("ShowFishing Completed");
  };
  const showFightingUI = () => {
    console.log("Show Fight UI Called");
    if (!isLoaded) return;
    //UnityInstance.send('Camera', 'SetUIState', 'ShowFighting');
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFighting");
  };
  const showBreedingUI = () => {
    console.log("Show Breed UI Called");
    if (!isLoaded) return;
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowBreeding");
  };

	const clearUIFish = () => {
    // console.log("ClearFishPool Called " + pool)
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send("FishPool", "ClearUIFish");
    // console.log("ClearFishPool Called " + pool)
  };

	const hideUI = () => {
		if (!isLoaded || !fishPoolReady) return;
		UnityInstance.send("CanvasUserInterface", "SetAnimState", "Hide");
	}

  const clearFishPool = (pool: string) => {
    // console.log("ClearFishPool Called " + pool)
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send("FishPool", "ClearPool", pool);
    // console.log("ClearFishPool Called " + pool)
  };
  const addFishOcean = (fish: Fish) => {
    console.log(`AddFish ${fish.tokenId}`);
    if (!isLoaded || !fishPoolReady) return;
    // console.log(fish)
    UnityInstance.send("FishPool", "AddFish_OceanView", JSON.stringify(fish));
    // console.log("AddFish Completed")
  };
  const addFishTank = (fish: Fish) => {
    console.log(`AddFish Tank${fish.tokenId}`);
    if (!isLoaded || !fishPoolReady) return;
    // console.log(fish)
    UnityInstance.send("FishPool", "AddFish_TankView", JSON.stringify(fish));
    // console.log("AddFish Completed")
  };
  const addFishFightingPool = (fish: Fish) => {
    // console.log("AddFish Called")
    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    UnityInstance.send(
      "FishPool",
      "AddFish_FightingView",
      JSON.stringify(fish)
    );
    // console.log("AddFish Completed")
  };
  const addFishFight1 = (fish: Fish) => {
    // console.log("AddFish Called")
    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    UnityInstance.send(
      "FishPool",
      "AddFish1_FightingView",
      JSON.stringify(fish)
    );

    UnityInstance.send(
      "ShowFighting_UI",
      "SetFish1",
    JSON.stringify(fish)
  );
    // console.log("AddFish Completed")
  };
  const addFishFight2 = (fish: Fish) => {
    // console.log("AddFish Called")
    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    UnityInstance.send(
      "FishPool",
      "AddFish2_FightingView",
      JSON.stringify(fish)
    );

    UnityInstance.send(
      "ShowFighting_UI",
      "SetFish2",
      JSON.stringify(fish)
    );
  };

  const addFishBreedingPool = (fish: Fish) => {
    // console.log("AddFish Called")
    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    UnityInstance.send(
      "FishPool",
      "AddFish_BreedingView",
      JSON.stringify(fish)
    );
    // console.log("AddFish Completed")
  };
  const addFishBreed1 = (fish: Fish) => {
    // console.log("AddFish Called")
    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    UnityInstance.send(
      "FishPool",
      "AddFish1_BreedingView",
      JSON.stringify(fish)
    );
    UnityInstance.send(
      "ShowBreeding_UI",
      "SetFish1",
      JSON.stringify(fish)
    );
    // console.log("AddFish Completed")
  };
  const addFishBreed2 = (fish: Fish) => {
    // console.log("AddFish Called")
    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    UnityInstance.send(
      "FishPool",
      "AddFish2_BreedingView",
      JSON.stringify(fish)
    );
    UnityInstance.send(
      "ShowBreeding_UI",
      "SetFish2",
      JSON.stringify(fish)
    );
    // console.log("AddFish Completed")
  };
  const addFishBreed3 = (fish: Fish) => {
    // console.log("AddFish Called")
    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    UnityInstance.send(
      "FishPool",
      "AddFish3_BreedingView",
      JSON.stringify(fish)
    );
    // console.log("AddFish Completed")
  };

  const addFish1 = (fish: Fish) => {
    console.log(fish);
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send("FishPool", "AddFish1_FishView", JSON.stringify(fish));
  };

  const addFish2 = (fish: Fish) => {
    console.log(fish);
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send("FishPool", "AddFish2_FishView", JSON.stringify(fish));
  };

  const addFish3 = (fish: Fish) => {
    console.log(fish);
    if (!isLoaded || !fishPoolReady) return;
    UnityInstance.send("FishPool", "AddFish3_FishView", JSON.stringify(fish));
  };

  const addFishFishing = (fish: Fish) => {
    console.log("AddFish Called");
    if (!isLoaded || !fishPoolReady) return;
    console.log(fish);
    UnityInstance.send("FishPool", "AddFish_FishingView", JSON.stringify(fish));
    console.log("AddFish Completed");
  };
  const showFish = (fish: Fish) => {
    console.log(fish);
    if (!isLoaded || !fishPoolReady) return;
		clearFishPool("Fish");
    UnityInstance.send("CanvasUserInterface", "SetAnimState", "ShowFish");
    UnityInstance.send("FishPool", "AddFish_FishView", JSON.stringify(fish));
    if (fish.parentAFish && fish.parentBFish) {
      addFish2(fish.parentAFish);
      addFish3(fish.parentBFish);
    }
  };
  const sendRound = (round: number, roundStat: number) => {
    console.log(roundStat);
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

  const sendFightResult = (fight: Fight) => {
    console.log("SendFight Called");
    console.log(fight)
    UnityInstance.send("FishPool", "SetFightResults", JSON.stringify(fight));
    console.log("SendFight Completed");
  };

  const sendTie = () => {
    console.log("SetTie Called");
    UnityInstance.send("FishPool", "SetTie");
    console.log("SetTie Completed");
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
    mintFish: mintFish,
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
    addFish1: addFish1,
    addFish2: addFish2,
    addFish3: addFish3,
    addFishFight1: addFishFight1,
    addFishFight2: addFishFight2,
    addFishBreed1: addFishBreed1,
    addFishBreed2: addFishBreed2,
    addFishFishing: addFishFishing,
    showFish: showFish,
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
