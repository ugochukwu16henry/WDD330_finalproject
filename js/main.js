// js/main.js
console.log("HenMo – Global Counseling & Wellness App");
console.log("Made with ❤️ by Henry Ugochukwu");

import { initQuotes } from './modules/quotes.js';
import { initMoodPrompts } from './modules/ui.js';

document.addEventListener('DOMContentLoaded', () => {
  initQuotes();
  initMoodPrompts();
});