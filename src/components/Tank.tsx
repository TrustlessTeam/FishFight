import { useState, useEffect } from 'react';

import { useFishPool } from '../context/fishPoolContext';
import { useUnity } from '../context/unityContext';
import { useWeb3React } from '@web3-react/core';

import Account from './Account';
// import FishViewer from './FishViewer';
import Menu, { MenuItem } from './Menu';
import { BaseContainer, ContainerControls, BaseLinkButton } from './BaseStyles';
import FishDrawer from './FishDrawer';

enum FishView {
	'Ocean',
	'User'
}

const Tank = () => {
	const { userFish, oceanFish } = useFishPool();
	const [fishToShow, setFishToShow] = useState<number>(FishView.Ocean);

	const [renderedFish, setRenderedFish] = useState<number[]>([]);
	const unityContext = useUnity();
	const { account } = useWeb3React();

	const FishViewOptions: MenuItem[] = [
		{
			name: 'Ocean Fish',
			onClick: () => setFishToShow(FishView.Ocean)
		},
		{
			name: 'My Fish',
			onClick: () => setFishToShow(FishView.User)
		}
	]

	useEffect(() => {
		console.log("CLEAR OCEAN")
		unityContext.clearFishPool('showOceanLocation')
	}, []);

	useEffect(() => {
		console.log("Account changed")
		if(account) {
			setFishToShow(FishView.User)
		} else {
			setFishToShow(FishView.Ocean)
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
		unityContext.showTank();
	}, [unityContext.isFishPoolReady]);

	return (

		<BaseContainer>
				<ContainerControls>
					<Menu name={FishView[fishToShow]} items={FishViewOptions}></Menu>
					{!account && fishToShow === FishView.User &&
						<Account/>
					}
					{fishToShow === FishView.User && account && userFish?.length === 0 &&
						<BaseLinkButton to={'/catch'}>Catch a Fish!</BaseLinkButton>
					}
				</ContainerControls>

				<FishDrawer fishCollection={fishToShow === FishView.Ocean ? oceanFish : userFish} onClick={unityContext.showFish}></FishDrawer>
		</BaseContainer>
		
	);
};

export default Tank;
