import { UnityContent } from 'react-unity-webgl';
import { Fish } from '../utils/fish';
import { createContext, useContext, useEffect, useState } from 'react';

interface UnityProviderContext {
	UnityInstance: UnityContent;
	isUnityMounted: boolean;
	isLoaded: boolean;
	progression: number;
	toggleIsUnityMounted: () => void;
	fishCaught: (fish: Fish) => void;
}

type UnityProviderProps = { children: React.ReactNode };

// Initiating context as undefined
const UnityContext = createContext<UnityProviderContext | undefined>(undefined);

// Defining context provider
export const UnityProvider = ({ children }: UnityProviderProps) => {
	// FishFight instance initiates with default url provider upon visiting page
	const [UnityInstance, setUnityInstance] = useState<UnityContent>(
		new UnityContent('../fishfight-one.json', '../UnityLoader.js'),
	);
	const [isUnityMounted, setIsUnityMounted] = useState(true);
	const [isLoaded, setIsLoaded] = useState(false);
	const [progression, setProgression] = useState(0);
	const [loadedFish, setLoadedFish] = useState('');
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
			// console.log('A message!', message);
		});
		UnityInstance.on('canvas', function (element: any) {
			// console.log('Canvas', element);
		});

		UnityInstance.on('CameraStartConfirmed', function () {
			console.log('CameraStartConfirmed!');
		});
		UnityInstance.on('FishPoolStartConfirmed', function () {
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
			console.log('AIOFHASIOFHI{ASHFI*{ASHFI){ASHFIO{ASHFIO{ASFHIO{HF{IASHFIO{ASIFHIIHFASIFHIh');
		});
	}, []);

	const fishCaught = (fish: Fish) => {
		console.log(JSON.stringify(fish))
		setLoadedFish(JSON.stringify(fish));
	};
	const ShowFishing = () => {
		UnityInstance.send('Camera', 'SetAnimState', 'ShowFishing');
	};
	const ShowFight = () => {
		UnityInstance.send('Camera', 'SetAnimState', 'ShowFight');
	};
	const ShowOcean = () => {
		UnityInstance.send('Camera', 'SetAnimState', 'ShowOcean');
	};

	const toggleIsUnityMounted = () => {
		setIsUnityMounted(!isUnityMounted);
	};

	const value: UnityProviderContext = {
		UnityInstance: UnityInstance,
		isUnityMounted: isUnityMounted,
		isLoaded: isLoaded,
		progression: progression,
		toggleIsUnityMounted: toggleIsUnityMounted,
		fishCaught: fishCaught,
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
