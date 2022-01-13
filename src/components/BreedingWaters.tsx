import { useEffect} from 'react';
import { Outlet } from "react-router-dom";
import { useUnity } from '../context/unityContext';


const BreedingWaters = () => {
	const unityContext = useUnity();

	useEffect(() => {
		console.log("Breeding Fish")
		unityContext.showBreeding();
		// unityContext.showBreed() ?
	}, [unityContext.isFishPoolReady]);

	return (
		<Outlet />
	);
};

export default BreedingWaters;
