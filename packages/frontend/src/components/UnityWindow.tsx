import React, { Fragment } from 'react';
import styled from 'styled-components';


import Unity, { UnityContent } from 'react-unity-webgl';
import { Fish } from '../utils/fish';

import { useUnity } from '../context/unityContext';

type Props = {
  children?: React.ReactNode;
};

const UnityWindow = ({ children }: Props) => {

	const unityContext = useUnity();
	
	return (
		<UnityWindowComponent>
			{!unityContext.isLoaded && <p>Loading {unityContext.progression * 100} percent...</p>}
			<Fragment>
				{unityContext.isUnityMounted === true && <Unity unityContent={unityContext.UnityInstance} />}
			</Fragment>
			{children}
		</UnityWindowComponent>
	);
};

const UnityWindowComponent = styled.div`
	/* margin-top: -280px;
	padding: 200px; */
	order: 0;
	position: relative;
	border-radius: 50%;
	width: 50vw;
	height: 50vw;
	max-height: 50vh;
	color: black;

	& > div {
		background: none !important;
	}

	& canvas {
		border-radius: 10%10%;
	}
`;

export default UnityWindow;
