// js/modules/quotes.js
const QUOTE_API_URL = 'https://favqs.com/api/qotd';
const API_KEY = '0d7a9d3f344399b0d2f0c9e0716d16b1';

// Replace this with your actual key (never push this file to public GitHub!)
const headers = {
  Authorization: `Token token="${API_KEY}"`,
  'Content-Type': 'application/json'
};

let currentQuote = null;

export async function initQuotes() {
  await fetchQuoteOfTheDay();
  setupSaveButton();
}

async function fetchQuoteOfTheDay() {
  const quoteTextEl = document.getElementById('quote-text');
  const quoteAuthorEl = document.getElementById('quote-author');
  const saveBtn = document.getElementById('save-quote');

  try {
    const response = await fetch(QUOTE_API_URL, { headers });
    
    if (!response.ok) throw new Error('Failed to fetch quote');

    const data = await response.json();
    const quote = data.quote;

    // Filter for mental-health-friendly content only
    const blockedWords = ['war', 'death', 'kill', 'hate', 'die', 'suicide', 'violence'];
    const isSafe = !blockedWords.some(word => 
      quote.body.toLowerCase().includes(word) || 
      quote.author?.toLowerCase().includes(word)
    );

    if (!isSafe) {
      fallbackQuote();
      return;
    }

    currentQuote = {
      text: quote.body,
      author: quote.author || 'Unknown',
      saved: false
    };

    quoteTextEl.textContent = `"${currentQuote.text}"`;
    quoteAuthorEl.textContent = `— ${currentQuote.author}`;
    saveBtn.textContent = '♡ Save Quote';
    saveBtn.disabled = false;

  } catch (err) {
    console.error('Quote fetch failed:', err);
    fallbackQuote();
  }
}

function fallbackQuote() {
  const fallbacks = [
    { text: "You are stronger than you think, and tomorrow is a new day full of hope.", author: "Henry Ugochukwu" },
    { text: "Healing is not linear. Every small step forward counts.", author: "HenMo" },
    { text: "It's okay to not be okay. Asking for help is a sign of strength.", author: "HenMo" },
    { text: "You deserve peace, love, and kindness — especially from yourself.", author: "Henry Ugochukwu" }
  ];

  const q = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  currentQuote = { text: q.text, author: q.author };

  document.getElementById('quote-text').textContent = `"${q.text}"`;
  document.getElementById('quote-author').textContent = `— ${q.author}`;
  document.getElementById('save-quote').textContent = '♡ Save Quote';
}

function setupSaveButton() {
  const saveBtn = document.getElementById('save-quote');
  
  saveBtn.addEventListener('click', () => {
    if (!currentQuote) return;

    let savedQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    
    // Prevent duplicates
    const exists = savedQuotes.some(q => q.text === currentQuote.text);
    if (exists) {
      saveBtn.textContent = '✓ Already Saved';
      saveBtn.disabled = true;
      return;
    }

    savedQuotes.push({
      ...currentQuote,
      savedAt: new Date().toISOString().split('T')[0]
    });

    localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));
    
    saveBtn.textContent = '✓ Saved!';
    saveBtn.style.background = 'var(--mint-green)';
    setTimeout(() => {
      if (saveBtn.textContent === '✓ Saved!') {
        saveBtn.textContent = '♡ Save Quote';
        saveBtn.style.background = '';
      }
    }, 2000);
  });
}