import { useState, useEffect } from 'react';

import { useFishPool } from '../context/fishPoolContext';
import { useUnity } from '../context/unityContext';
import { useWeb3React } from '@web3-react/core';

import Account from './Account';
import FishViewer from './FishViewer';
import Menu from './Menu';
import { BaseContainer, ContainerControls, BaseLinkButton } from './BaseStyles';

const ModeOptions = ['Ocean Fish', 'My Fish']

const Ocean = () => {
	const { userFish, oceanFish } = useFishPool();
	const [fishToShow, setFishToShow] = useState<string>(ModeOptions[0]);
	const [renderedFish, setRenderedFish] = useState<number[]>([]);
	const unityContext = useUnity();
	const { account } = useWeb3React();


	useEffect(() => {
		console.log("CLEAR OCEAN")
		unityContext.clearFishPool('ShowOcean')
	}, []);

	useEffect(() => {
		console.log("Account changed")
		if(account) {
			setFishToShow(ModeOptions[1])
		} else {
			setFishToShow(ModeOptions[0])
		}
	}, [account]);

	useEffect(() => {
		console.log("Ocean Fish Changed")
		// console.log(oceanFish)
		if(!unityContext.isFishPoolReady) return;
		let i = 0;
		oceanFish.forEach(fish => {
			if(!renderedFish.includes(fish.tokenId)) {
				unityContext.addFishOcean(fish);
				setRenderedFish(prevData => [...prevData, fish.tokenId])
				i++;
			}
		})
		console.log(i)
	}, [oceanFish, unityContext.isFishPoolReady]);

	useEffect(() => {
		unityContext.showOcean();
	}, [unityContext.isFishPoolReady]);

	return (

		<BaseContainer>
				<ContainerControls>
					<Menu name={fishToShow} onClick={setFishToShow} items={ModeOptions}></Menu>
					{!account && fishToShow === ModeOptions[1] &&
						<Account/>
					}
					{fishToShow === ModeOptions[1] && account && userFish?.length === 0 &&
						<BaseLinkButton to={'/catch'}>Catch a Fish!</BaseLinkButton>
					}
				</ContainerControls>

				<FishViewer fishCollection={fishToShow === ModeOptions[0] ? oceanFish : userFish} onClick={unityContext.showFish}></FishViewer>
		</BaseContainer>
		
	);
};

export default Ocean;
