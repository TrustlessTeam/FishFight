import { UnityContent } from 'react-unity-webgl';
import { Fish } from '../utils/fish';
import { createContext, useContext, useEffect, useState } from 'react';

interface UnityProviderContext {
	UnityInstance: UnityContent;
	isUnityMounted: boolean;
	isLoaded: boolean;
	progression: number;
	isFishPoolReady: boolean,
	toggleIsUnityMounted: () => void;
	fishCaught: (fish: Fish) => void;
	showFishing: () => void;
	showOcean: () => void;
	showFight: () => void;
	addFish: (fish: Fish) => void;
	clearFishPool: () => void;
}

type UnityProviderProps = { children: React.ReactNode };

// Initiating context as undefined
const UnityContext = createContext<UnityProviderContext | undefined>(undefined);

// Defining context provider
export const UnityProvider = ({ children }: UnityProviderProps) => {
	// FishFight instance initiates with default url provider upon visiting page
	const [UnityInstance, setUnityInstance] = useState<UnityContent>(
		new UnityContent('./Build/fishfight-one-frontend.json', './Build/UnityLoader.js'),
	);
	const [isUnityMounted, setIsUnityMounted] = useState(true);
	const [isLoaded, setIsLoaded] = useState(false);
  const [fishPoolReady, setFishPoolReady] = useState(false);
	const [progression, setProgression] = useState(0);

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
				case 'mint_fish_75p':

					return ;
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
			console.log('Received from ');
		});
	}, []);

	const fishCaught = (fish: Fish) => {
		console.log("FishCaught Called")
    if(!isLoaded || !fishPoolReady) return;
		console.log(JSON.stringify(fish))
    UnityInstance.send('CanvasUserInterface', 'FishCaught', JSON.stringify(fish));
		console.log("FishCaught Completed")
	};
	const showFishing = () => {
		console.log("ShowFishing Called")
    if(!isLoaded || !fishPoolReady) return;
		UnityInstance.send('Camera', 'SetAnimState', 'ShowFishing');
		console.log("ShowFishing Completed")
	};
	const showFight = () => {
		console.log("ShowFight Called")
    if(!isLoaded || !fishPoolReady) return;
		UnityInstance.send('Camera', 'SetAnimState', 'ShowFight');
		console.log("ShowFight Completed")
	};
	const showOcean = () => {
		console.log("ShowOcean Called")
    if(!isLoaded || !fishPoolReady) return;
		UnityInstance.send('Camera', 'SetAnimState', 'ShowOcean');
		console.log("ShowOcean Completed")
	};
	const clearFishPool = () => {
		console.log("ClearFishPool Called")
    if(!isLoaded || !fishPoolReady) return;
		UnityInstance.send('FishPool', 'ClearPool');
		console.log("ClearFishPool Completed")
	};
  const addFish = (fish: Fish) => {
		console.log("AddFish Called")
    if(!isLoaded || !fishPoolReady) return;
		console.log(fish)
		UnityInstance.send('FishPool', 'AddFish', JSON.stringify(fish));
		console.log("AddFish Completed")
	};
	const showFish = () => {
		console.log("ShowFish Called")
    if(!isLoaded || !fishPoolReady) return;
		UnityInstance.send('Camera', 'SetAnimState', 'ShowFish');
		console.log("ShowFish Completed")
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
    showFishing: showFishing,
    showOcean: showOcean,
    showFight: showFight,
    addFish: addFish,
		clearFishPool: clearFishPool
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
