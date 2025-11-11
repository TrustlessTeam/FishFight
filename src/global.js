// Global polyfills for browser compatibility
/* eslint-disable no-global-assign */
global = window;
/* eslint-enable no-global-assign */
window.globalThis = window;
window.global = global;

// Howler.js global - must be defined before Howler.js loads
window.HowlerGlobal = { _pos: 0 };

// Define Howl placeholder for Howler.js (will be overridden)
window.Howl = function() {};
window.Howl.prototype = {};
