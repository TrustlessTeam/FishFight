/// <reference types="react-scripts" />
import 'styled-components';

declare global {
	interface Window {
		ethereum: any;
		harmony: any;
		onewallet: any;
	}
}

declare module "*.mp3" {
  const value: any;
  export default value;
}

window.onewallet = window.onewallet || {};
