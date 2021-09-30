import { UnityContent } from 'react-unity-webgl';
import { Fish } from '../utils/fish';
import { createContext, useContext, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';

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
	showOcean: () => void;
	showFight: () => void;
	showHome: () => void;
	addFishOcean: (fish: Fish) => void,
	addFishFight: (fish: Fish) => void;
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
	// FishFight instance initiates with default url provider upon visiting page
	const [UnityInstance, setUnityInstance] = useState<UnityContent>(
		new UnityContent('./Unity/fishfight-one-frontend.json', './Unity/UnityLoader.js'),
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
		// UnityInstance.on('UISelectionConfirm', function (data: any) {
		// 	console.log('UI changed');
		// 	console.log(data)
		// 	switch (data) {
		// 		case 'mint_fish_5p':
		// 			setMintFish(4);
		// 			return;
		// 		case 'mint_fish_25p':
		// 			setMintFish(3);
		// 			return;
		// 		case 'mint_fish_50p':
		// 			setMintFish(2);
		// 			return;
		// 		case 'mint_fish_75p':
		// 			setMintFish(1);
		// 			return;
		// 		case 'disclaimer_confirm':
		// 			if(cookies['accepted_terms'] == true) return;
    // 			setCookie('accepted_terms', true);
		// 			return;
		// 		default:
		// 			setMintFish(0)
		// 			return;
		// 	}
		// });
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
		UnityInstance.send('Camera', 'SetAnimState', 'ShowFight');
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
	const addFishFight = (fish: Fish) => {
		// console.log("AddFish Called")
    if(!isLoaded || !fishPoolReady) return;
		console.log(fish)
		UnityInstance.send('FishPool', 'AddFish_FightView', JSON.stringify(fish));
		// console.log("AddFish Completed")
	};
	const addFishFishing = (fish: Fish) => {
		console.log("AddFish Called")
    if(!isLoaded || !fishPoolReady) return;
		console.log(fish)
		UnityInstance.send('FishPool', 'AddFish_FishingView', JSON.stringify(fish));
		console.log("AddFish Completed")
	};
	const showFish = (fish: Fish) => {
		// console.log("ShowFish Called")
    if(!isLoaded || !fishPoolReady) return;
		UnityInstance.send('Camera', 'SetAnimState', 'ShowFish');
		UnityInstance.send('FishPool', 'AddFish_FishView', JSON.stringify(fish));
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
    showOcean: showOcean,
    showFight: showFight,
		showHome: showHome,
    addFishOcean: addFishOcean,
		addFishFight: addFishFight,
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
