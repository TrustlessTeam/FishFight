import React, { Fragment } from 'react';
import styled from 'styled-components';
import {
  Outlet
} from "react-router-dom";


import Unity, { UnityContent } from 'react-unity-webgl';

import { useUnity } from '../context/unityContext';


const UnityWindow = () => {

	const unityContext = useUnity();
	
	return (
		<UnityWindowComponent>
			{!unityContext.isLoaded && <p className="loading-text">Approaching Genesis Landing {unityContext.progression * 100} ...</p>}
			<Fragment>
				{unityContext.isUnityMounted === true && <Unity unityContent={unityContext.UnityInstance} />}
				<Viewer>
					<Outlet />
				</Viewer>
			</Fragment>
		</UnityWindowComponent>
	);
};

const UnityWindowComponent = styled.div`
	position: relative;
	width: 100%;
	height: calc(100% - 1px);
	& > div {
		background: none !important;
	}
`;

const Viewer = styled.div`
  position: absolute;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-end;
	width: 100%;
  height: 100%;
  pointer-events: none;
  bottom: 0;
  background: white;
  z-index: 5;
`;

export default UnityWindow;
