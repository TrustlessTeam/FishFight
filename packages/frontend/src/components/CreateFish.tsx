import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useWeb3React } from '@web3-react/core';
import { fromWei, Units, Unit } from '@harmony-js/utils';
import { Contract } from '@harmony-js/contract';

import { useHarmony } from '../context/harmonyContext';

import { createFishFactoryContract, getFishFactoryContractFromConnector } from '../helpers/contractHelper';

const CreateFish = () => {
	const [randomValue, setRandomValue] = useState('0');
	const { hmy, fetchBalance } = useHarmony();
	const [contract, setContract] = useState<Contract | null>(createFishFactoryContract(hmy));
	const [myFish, setMyFish] = useState<any[]>([]);
	const [myFishCount, setMyFishCount] = useState(0);
	const [fishName, setFishName] = useState("Name Your Fish")

	const { account, connector, library } = useWeb3React();

	// const getDonationStored = async () => {
	// 	if (contract) {
	// 		try {
	// 			const donations = await contract.methods.getDonationStored().call();
	// 			const parsedDonations = fromWei(donations, Units.one);
	// 			setDonationStored(parsedDonations);
	// 		} catch (error) {
	// 			console.error(error);
	// 		}
	// 	}
	// };
	
	useEffect(() => {
		if (!account) {
			setContract(null);
		}
	}, [account]);

	useEffect(() => {
		if (connector) {
			(async () => {
				const contract = await getFishFactoryContractFromConnector(connector, library);
				setContract(contract);
				loadUsersFish(contract);
			})();
		}
	}, [connector, setContract]);

	async function loadUsersFish(contract : Contract) {
		console.log(account)
		const fishUserOwns = await contract.methods.balanceOf(account).call();
		console.log(fishUserOwns)
		setMyFishCount(fishUserOwns);
		for(let i = 0; i < fishUserOwns; i++) {
			const tokenId = await contract.methods.tokenOfOwnerByIndex(account, i).call();
			const fishInfo = await contract.methods.getFishInfo(tokenId).call();
			console.log(tokenId + ' ' + fishInfo)
			setMyFish(myFish => [...myFish, fishInfo])
		}   
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFishName(e.target.value);
 	}


	const handleClick = () => async () => {
		if (account && contract) {
			try {
				const rand = await contract.methods.vrf().call();
				setRandomValue(rand);
				console.log(rand)
				toast.success('Transaction done', {
					onClose: async () => {
						// await fetchBalance(account);
						// getDonationStored();
					},
				});
			} catch (error) {
				toast.error(error);
			}
		} else {
			toast.error('Connect your wallet');
		}
	};

	const handleClickMint = (value: string) => async () => {
		if (account && contract) {
			console.log("mint clicked")
			try {
				await contract.methods.createFish(value).send({
					from: account,
					gasPrice: 1000000000,
					gasLimit: 210000,
					value: new Unit(0).asOne().toWei(),
				});
				toast.success('Transaction done', {
					onClose: async () => {
						loadUsersFish(contract)
					},
				});
			} catch (error) {
				toast.error(error);
			}
		} else {
			toast.error('Connect your wallet');
		}
	};

	return (
		<CreateFishComponent>
			<Wrapper>
				Value Return from Harmony VRF
				<TotalStaked>{randomValue}</TotalStaked>
			</Wrapper>
			<RandomButton onClick={handleClick()}>
					GetRandomValue
			</RandomButton>
			<form>
        <label>
          Fish Name:{fishName}
          <input type="text" value={fishName} onChange={handleChange} />
				</label>
      </form>
			<RandomButton onClick={handleClickMint(fishName)}>Mint Fish</RandomButton>
			<h1>Fished Owned: {myFishCount}</h1>
			<FlexList>
			{myFish.map((fish, index) => (
					<li key={index}>
						{fish}
					</li>
				))}
			</FlexList>
		</CreateFishComponent>
	);
};

const CreateFishComponent = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 50%;
`;

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: -10vh;
	padding: 40px 60px;
	border-radius: 25px;
	width: 100%;
	background-color: white;
	box-shadow: 2px 8px 10px 4px rgba(0, 0, 0, 0.3);
	color: #a70000;
	font-size: 1.5rem;
`;

const FlexList = styled.ul`
	display: flex;
	flex-flow: column nowrap;
	justify-content: center;
	padding: 0;
	list-style: none;
	margin-top: 40px;
	width: 100%;

	& > li {
		margin-right: 20px;
	}
`;

const Subtitle = styled.h2`
	font-size: 2rem;
	color: white;
	margin-bottom: 0;
`;

const RandomButton = styled.button`
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: rgba(255, 255, 255, 0.7);
	color: black;
	padding: 20px 20px;
	border-radius: 10px;
	box-shadow: 1px 2px 4px 4px rgba(0, 0, 0, 0.2);
	font-size: 1.5rem;
	transition: background-color 0.3s ease;

	&:hover {
		background-color: rgba(255, 255, 255, 1);
		cursor: pointer;
	}

	span {
		font-size: 1rem;
		margin-left: 8px;
		align-self: flex-end;
	}
`;

const TotalStaked = styled.div`
	font-size: 3.5rem;
	margin-top: 16px;
	color: black;
`;

export default CreateFish;
