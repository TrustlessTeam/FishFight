import React, { Fragment, useState, useEffect } from 'react';
import styled from 'styled-components';


import Unity, { UnityContent } from 'react-unity-webgl';
import { Fish } from '../utils/fish';

import { useUnity } from '../context/unityContext';

const UnityWindow = () => {

	const unityContext = useUnity()
	

	return (
		<UnityWindowComponent>
			{!unityContext.isLoaded && <p>Loading {unityContext.progression * 100} percent...</p>}
			{/* <Unity unityContent={unityContext.UnityInstance} /> */}
			<Fragment>
				{unityContext.isUnityMounted === true && <Unity unityContent={unityContext.UnityInstance} />}
			</Fragment>
		</UnityWindowComponent>
	);
};

const UnityWindowComponent = styled.div`
	position: relative;
	padding: 100px;
	border-radius: 50%;
	width: 100%;
	background-color: white;
	color: black;

	& > span {
		margin-left: 4px;
	}
`;

export default UnityWindow;
