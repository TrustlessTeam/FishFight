import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';

import { useHarmony } from '../context/harmonyContext';
import { useFishFight } from '../context/fishFightContext';

const Balance = () => {
	const { balance  } = useFishFight();

	if (!balance) return null;

	return (
		<BalanceComponent>
			<b>{balance}</b> <span>ONE</span>
		</BalanceComponent>
	);
};

const BalanceComponent = styled.div`
	padding: 10px 20px;
	border-radius: 25px;
	background-color: white;
	color: black;

	& > span {
		margin-left: 4px;
	}
`;

export default Balance;
