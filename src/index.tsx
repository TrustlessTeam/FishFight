// Import global polyfills first
import './global.js';

import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { CookiesProvider } from 'react-cookie';
import { HarmonyProvider } from './context/harmonyContext';
import { Web3ReactProvider } from '@web3-react/core';
import { getLibraryProvider } from './utils/provider';
import { FishFightProvider } from './context/fishFightContext';
import { UnityProvider } from './context/unityContext';
import { FishPoolProvider } from './context/fishPoolContext';
import { ContractWrapperProvider } from './context/contractWrapperContext';
import { BrowserRouter as Router } from 'react-router-dom';


const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
	<React.StrictMode>
		<Router>
			<CookiesProvider>
				<Web3ReactProvider getLibrary={getLibraryProvider}>
					<HarmonyProvider>
						<UnityProvider>
							<FishFightProvider>
								<FishPoolProvider>
									<ContractWrapperProvider>
										<App />
									</ContractWrapperProvider>
								</FishPoolProvider>
							</FishFightProvider>
						</UnityProvider>
					</HarmonyProvider>
				</Web3ReactProvider>
			</CookiesProvider>
		</Router>

	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
