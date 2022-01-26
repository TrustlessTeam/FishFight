import { UnityContent } from 'react-unity-webgl';
import { Fish } from '../utils/fish';
import { createContext, useContext, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';

import {
  BrowserRouter as Router,
  Route,
  Link,
  NavLink,
  useLocation
} from "react-router-dom";

interface UnityProviderContext {
	UnityInstance: UnityContent;
	isUnityMounted: boolean;
	isLoaded: boolean;
	progression: number;
	isFishPoolReady: boolean,
	mintFish: number,
	toggleIsUnityMounted: () => void;
	fishCaught: (fish: Fish) => void;
	showFishing: () => void;
	showBreeding: () => void;
	showOcean: () => void;
	showFight: () => void;
	showHome: () => void;
	showTank: () => void;
	addFishOcean: (fish: Fish) => void,
	addFishTank: (fish: Fish) => void,
	addFishFightingPool: (fish: Fish) => void,
	addFishBreedingPool: (fish: Fish) => void,
	addFishFight1: (fish: Fish) => void;
	addFishFight2: (fish: Fish) => void;
	addFishBreed1: (fish: Fish) => void;
	addFishBreed2: (fish: Fish) => void;
	addFishFishing: (fish: Fish) => void;
	showFish: (fish: Fish) => void;
	clearFishPool: (pool: string) => void;
	sendRound: (round: number, roundStat: number) => void;
	sendWinner: (fish: Fish) => void;
	sendTie: () => void;
}

type UnityProviderProps = { children: React.ReactNode };

// Initiating context as undefined
const UnityContext = createContext<UnityProviderContext | undefined>(undefined);

// Defining context provider
export const UnityProvider = ({ children }: UnityProviderProps) => {
	const pathsCount = useLocation().pathname.split('/').length;
	let basePath = '.';
	if(pathsCount == 3) {
		basePath = '..';
	}
	// FishFight instance initiates with default url provider upon visiting page
	const [UnityInstance, setUnityInstance] = useState<UnityContent>(
		new UnityContent(`${basePath}/Unity/fishfight-one-frontend.json`, `${basePath}/Unity/UnityLoader.js`),
	);
	const [isUnityMounted, setIsUnityMounted] = useState(true);
	const [isLoaded, setIsLoaded] = useState(false);
  const [fishPoolReady, setFishPoolReady] = useState(false);
	const [progression, setProgression] = useState(0);
	const [mintFish, setMintFish] = useState(0);
	const [cookies, setCookie] = useCookies(['accepted_terms']);

	useEffect(() => {
		console.log(UnityInstance);
		UnityInstance.on('progress', setProgression);
		UnityInstance.on('loaded', function () {
			setIsLoaded(true);
		});
		UnityInstance.on('error', function (message: any) {
			// console.log('An error!', message);
		});
		UnityInstance.on('log', function (message: any) {
			console.log('A message!', message);
		});
		UnityInstance.on('canvas', function (element: any) {
			// console.log('Canvas', element);
		});

		UnityInstance.on('CameraStartConfirm', function () {
			console.log('CameraStartConfirmed!');
		});
		UnityInstance.on('UISelectionConfirm', function (data: any) {
			console.log('UI changed');
			console.log(data)
			switch (data) {
				case 'disclaimer_confirm':
					if(cookies['accepted_terms'] === true) return;
    			setCookie('accepted_terms', true);
					return;
				default:
					return;
			}
		});
		UnityInstance.on('FishPoolStartConfirm', function () {
      setFishPoolReady(true);
			console.log('FishPoolStartConfirmed!');
		});
		UnityInstance.on('SetAnimStateConfirm', function () {
			console.log('SetAnimStateConfirm!');
		});
		UnityInstance.on('ClearPoolConfirm', function () {
			console.log('ClearPoolConfirm!');
		});
		UnityInstance.on('AddFishConfirm', function () {
			console.log('AddFishConfirm!');
		});
		UnityInstance.on('SetFishingStateConfirm', function () {
			console.log('SetFishingStateConfirm!');
		});
		UnityInstance.on('SetFightStateConfirm', function () {
			console.log('SetFightStateConfirm!');
		});
		UnityInstance.on('FishCaughtReceived', function () {
			console.log('FishCaughtReceived');
		});
		UnityInstance.on('FishPoolFightRound1', function () {
			console.log('Confirm FishPoolFightRound1');
		});
		UnityInstance.on('FishPoolFightRound2', function () {
			console.log('Confirm FishPoolFightRound2');
		});
		UnityInstance.on('FishPoolFightRound3', function () {
			console.log('Confirm FishPoolFightRound3');
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
    if(!isLoaded || !fishPoolReady) return;
		console.log(JSON.stringify(fish))
    UnityInstance.send('CanvasUserInterface', 'FishCaught', JSON.stringify(fish));
		// console.log("FishCaught Completed")
	};
	const showFishing = () => {
		// console.log("ShowFishing Called")
    if(!isLoaded || !fishPoolReady) return;
		UnityInstance.send('Camera', 'SetAnimState', 'ShowFishing');
		// console.log("ShowFishing Completed")
	};
	const showFight = () => {
		// console.log("ShowFight Called")
    if(!isLoaded || !fishPoolReady) return;
		UnityInstance.send('Camera', 'SetAnimState', 'ShowFighting');
		// console.log("ShowFight Completed")
	};
	const showBreeding = () => {
		// console.log("ShowFight Called")
    if(!isLoaded || !fishPoolReady) return;
		UnityInstance.send('Camera', 'SetAnimState', 'ShowBreeding');
		// console.log("ShowFight Completed")
	};
	const showOcean = () => {
		// console.log("ShowOcean Called")
    if(!isLoaded || !fishPoolReady) return;
		UnityInstance.send('Camera', 'SetAnimState', 'ShowOcean');
		// console.log("ShowOcean Completed")
	};
	const showHome = () => {
		console.log("ShowHome Called")
    if(!isLoaded) return;
		UnityInstance.send('Camera', 'SetAnimState', 'ShowHome');
		console.log("ShowHome Completed")
	};
	const showTank = () => {
		console.log("ShowTank Called")
    if(!isLoaded) return;
		UnityInstance.send('Camera', 'SetAnimState', 'ShowTank');
		console.log("ShowTank Completed")
	};

	const renderSubsetOfFish = (fishColletion: Fish[]) => {

	}

	const clearFishPool = (pool: string) => {
		// console.log("ClearFishPool Called " + pool)
    if(!isLoaded || !fishPoolReady) return;
		UnityInstance.send('FishPool', 'ClearPool', pool);
		// console.log("ClearFishPool Called " + pool)
	};
  const addFishOcean = (fish: Fish) => {
		console.log(`AddFish ${fish.tokenId}`)
    if(!isLoaded || !fishPoolReady) return;
		// console.log(fish)
		UnityInstance.send('FishPool', 'AddFish_OceanView', JSON.stringify(fish));
		// console.log("AddFish Completed")
	};
	const addFishTank = (fish: Fish) => {
		console.log(`AddFish Tank${fish.tokenId}`)
    if(!isLoaded || !fishPoolReady) return;
		// console.log(fish)
		UnityInstance.send('FishPool', 'AddFish_TankView', JSON.stringify(fish));
		// console.log("AddFish Completed")
	};
	const addFishFightingPool = (fish: Fish) => {
		// console.log("AddFish Called")
    if(!isLoaded || !fishPoolReady) return;
		console.log(fish)
		UnityInstance.send('FishPool', 'AddFish_FightingView', JSON.stringify(fish));
		// console.log("AddFish Completed")
	};
	const addFishFight1 = (fish: Fish) => {
		// console.log("AddFish Called")
    if(!isLoaded || !fishPoolReady) return;
		console.log(fish)
		UnityInstance.send('FishPool', 'AddFish1_FightingView', JSON.stringify(fish));
		// console.log("AddFish Completed")
	};
	const addFishFight2 = (fish: Fish) => {
		// console.log("AddFish Called")
    if(!isLoaded || !fishPoolReady) return;
		console.log(fish)
		UnityInstance.send('FishPool', 'AddFish2_FightingView', JSON.stringify(fish));
		// console.log("AddFish Completed")
	};

	const addFishBreedingPool = (fish: Fish) => {
		// console.log("AddFish Called")
    if(!isLoaded || !fishPoolReady) return;
		console.log(fish)
		UnityInstance.send('FishPool', 'AddFish_FightingView', JSON.stringify(fish));
		// console.log("AddFish Completed")
	};
	const addFishBreed1 = (fish: Fish) => {
		// console.log("AddFish Called")
    if(!isLoaded || !fishPoolReady) return;
		console.log(fish)
		UnityInstance.send('FishPool', 'AddFish1_BreedingView', JSON.stringify(fish));
		// console.log("AddFish Completed")
	};
	const addFishBreed2 = (fish: Fish) => {
		// console.log("AddFish Called")
    if(!isLoaded || !fishPoolReady) return;
		console.log(fish)
		UnityInstance.send('FishPool', 'AddFish2_BreedingView', JSON.stringify(fish));
		// console.log("AddFish Completed")
	};
	const addFishBreed3 = (fish: Fish) => {
		// console.log("AddFish Called")
    if(!isLoaded || !fishPoolReady) return;
		console.log(fish)
		UnityInstance.send('FishPool', 'AddFish3_BreedingView', JSON.stringify(fish));
		// console.log("AddFish Completed")
	};

	const addFish1 = (fish: Fish) => {
		console.log(fish)
    if(!isLoaded || !fishPoolReady) return;
		UnityInstance.send('FishPool', 'AddFish1', JSON.stringify(fish));
	}

	const addFish2 = (fish: Fish) => {
		console.log(fish)
    if(!isLoaded || !fishPoolReady) return;
		UnityInstance.send('FishPool', 'AddFish2', JSON.stringify(fish));
	}

	const addFish3 = (fish: Fish) => {
		console.log(fish)
    if(!isLoaded || !fishPoolReady) return;
		UnityInstance.send('FishPool', 'AddFish3', JSON.stringify(fish));
	}
	
	const addFishFishing = (fish: Fish) => {
		console.log("AddFish Called")
    if(!isLoaded || !fishPoolReady) return;
		console.log(fish)
		UnityInstance.send('FishPool', 'AddFish_FishingView', JSON.stringify(fish));
		console.log("AddFish Completed")
	};
	const showFish = (fish: Fish) => {
		console.log(fish)
    if(!isLoaded || !fishPoolReady) return;
		UnityInstance.send('Camera', 'SetAnimState', 'ShowFish');
		// addFish1(fish);
		UnityInstance.send('FishPool', 'AddFish_FishView', JSON.stringify(fish));
		if(fish.parentAFish && fish.parentBFish) {
			addFish2(fish.parentAFish);
			addFish3(fish.parentBFish);
		}
		// UnityInstance.send('FishPool', 'AddFish_FishView', JSON.stringify(fish));
		// console.log("ShowFish Completed")
	};
	const sendRound = (round: number, roundStat: number) => {
		console.log(roundStat)
		switch (round) {
			case 1:
				UnityInstance.send('FishPool', 'SetRound1Stat', roundStat)
				break;
			case 2:
				UnityInstance.send('FishPool', 'SetRound2Stat', roundStat)
				break;
			case 3:
				UnityInstance.send('FishPool', 'SetRound3Stat', roundStat)
				break;
			default:
				break;
		}
	}

	const sendWinner = (fish: Fish) => {
		console.log("SetWinner Called")
		UnityInstance.send('FishPool', 'SetWinner', JSON.stringify(fish));
		console.log("SetWinner Completed")
	};

	const sendTie = () => {
		console.log("SetTie Called")
		UnityInstance.send('FishPool', 'SetTie');
		console.log("SetTie Completed")
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
    showFishing: showFishing,
		showBreeding: showBreeding,
    showOcean: showOcean,
    showFight: showFight,
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
		addFishFishing: addFishFishing,
		showFish: showFish,
		clearFishPool: clearFishPool,
		sendRound: sendRound,
		sendWinner: sendWinner,
		sendTie: sendTie
	};
	return <UnityContext.Provider value={value}>{children}</UnityContext.Provider>;
};

// useFishFight
export const useUnity = () => {
	const context = useContext(UnityContext);

	if (!context) {
		throw 'useFishFight must be used within a FishFightProvider';
	}
	return context;
};
