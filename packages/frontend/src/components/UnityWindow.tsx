import React, { Fragment, useState, useEffect } from 'react';
import styled from 'styled-components';


import Unity, { UnityContent } from 'react-unity-webgl';
import { Fish } from '../utils/fish';

import { useUnity } from '../context/unityContext';

const UnityWindow = () => {

	const unityContext = useUnity()
	

	return (
		<UnityWindowComponent>
			<Unity unityContent={unityContext.UnityInstance} />
			<Fragment>
				<h1>React Unity WebGL Test</h1>
				<p>Loading {unityContext.progression * 100} percent...</p>
				{unityContext.isLoaded === true && <p>Loaded!</p>}
				{/* <button children={'Start Rotation'} onClick={unityContext.startRotation} />
				<button children={'Stop Rotation'} onClick={unityContext.stopRotation} />
				<button children={'(Un)mount'} onClick={unityContext.toggleIsUnityMounted} /> */}
				<br />
				{unityContext.isUnityMounted === true && <Unity unityContent={unityContext.UnityInstance} />}
			</Fragment>
		</UnityWindowComponent>
	);
};

const UnityWindowComponent = styled.div`
	position: relative;
	padding: 10px 20px;
	border-radius: 25px;
	background-color: white;
	color: black;

	& > span {
		margin-left: 4px;
	}
`;

export default UnityWindow;
