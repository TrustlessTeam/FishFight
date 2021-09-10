import { UnityContent } from 'react-unity-webgl';
import { Fish } from "../utils/fish";
import { createContext, useContext, useEffect, useState} from "react"

interface UnityProviderContext {
    UnityInstance: UnityContent
    isUnityMounted: boolean
    isLoaded: boolean
    progression: number
    // rotation: number
    message: string
    clickedPosition: any
    startRotation: () => void
    stopRotation: () => void
    toggleIsUnityMounted: () => void
    fishCaught: (fish: Fish) => void
}

type UnityProviderProps = { children: React.ReactNode }

// Initiating context as undefined
const UnityContext = createContext<UnityProviderContext | undefined>(undefined);

// Defining context provider
export const UnityProvider = ({ children }: UnityProviderProps ) => {
  // FishFight instance initiates with default url provider upon visiting page
  const [UnityInstance, setUnityInstance] = useState<UnityContent>(new UnityContent('../Build/fishfight-one.json', '../Build/UnityLoader.js'))
  const [isUnityMounted, setIsUnityMounted] = useState(true);
	const [isLoaded, setIsLoaded] = useState(false);
	const [progression, setProgression] = useState(0);
	// const [rotation, setRotation] = useState(0);
	const [message, setMessage] = useState('');
	const [clickedPosition, setClickedPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    UnityInstance.on('progress', setProgression);
		UnityInstance.on('loaded', function () {
			setIsLoaded(true);
		});
		UnityInstance.on('error', function ( message: any ) {
			// console.log('An error!', message);
		});
		UnityInstance.on('log', function (message: any ) {
			// console.log('A message!', message);
		});
		UnityInstance.on('canvas', function (element: any ) {
			// console.log('Canvas', element);
		});
		UnityInstance.on('RotationDidUpdate', function () {
      null;
    });
		UnityInstance.on('Say', setMessage);
		UnityInstance.on('ClickedPosition', function (x: any, y: any ) {
			// setClickedPosition({ x, y });
		});
    UnityInstance.on('FishCaughtReceived', function() {
      console.log("AIOFHASIOFHI{ASHFI*{ASHFI){ASHFIO{ASHFIO{ASFHIO{HF{IASHFIO{ASIFHIIHFASIFHIh")
    })
    
  }, [])
  

  const startRotation = () => {
		UnityInstance.send('MeshCrate', 'StartRotation');
	}

	const stopRotation = () => {
		UnityInstance.send('MeshCrate', 'StopRotation');
	}

	const fishCaught = (fish: Fish) => {
		UnityInstance.send('CanvasUserInterface', 'FishCaught', JSON.stringify(fish));
	}

	const toggleIsUnityMounted = () => {
		setIsUnityMounted(!isUnityMounted);
	}

  const value: UnityProviderContext = {
    UnityInstance: UnityInstance,
    isUnityMounted: isUnityMounted,
    isLoaded: isLoaded,
    progression: progression,
    // rotation: rotation,
    message: message,
    clickedPosition: clickedPosition,
    startRotation: startRotation,
    stopRotation: stopRotation,
    toggleIsUnityMounted: toggleIsUnityMounted,
    fishCaught: fishCaught
  }
  return (
      <UnityContext.Provider value={value}>{children}</UnityContext.Provider>
  )
}


// useFishFight
export const useUnity = () => {
    const context = useContext(UnityContext)

    if(!context) {
        throw 'useFishFight must be used within a FishFightProvider';
    }
    return context
}