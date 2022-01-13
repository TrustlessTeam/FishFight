import { useEffect} from 'react';
import { Outlet } from "react-router-dom";
import { useUnity } from '../context/unityContext';


const FightingWaters = () => {
	const unityContext = useUnity();

	useEffect(() => {
		console.log("UserFightingFish")
		unityContext.showFight();
	}, [unityContext.isFishPoolReady]);

	return (
		<Outlet />
	);
};

export default FightingWaters;
