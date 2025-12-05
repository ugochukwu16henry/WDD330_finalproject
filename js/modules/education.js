// js/modules/education.js

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes?q=intitle:mental+health+OR+intitle:anxiety+OR+intitle:depression+OR+intitle:therapy+OR+intitle:self-care&maxResults=12';

document.addEventListener('DOMContentLoaded', () => {
  loadArticles();
  document.getElementById('search-books-btn').addEventListener('click', searchBooks);
  document.getElementById('book-search').addEventListener('keypress', e => {
    if (e.key === 'Enter') searchBooks();
  });
});

async function loadArticles() {
  const response = await fetch('data/articles.json');
  const articles = await response.json();
  
  const grid = document.getElementById('articles-grid');
  grid.innerHTML = articles.map(article => `
    <div class="article-card">
      <img src="${article.image}" alt="${article.title}">
      <div class="article-content">
        <h3>${article.title}</h3>
        <p>${article.summary}</p>
        <p><small>${article.readTime} read</small></p>
        <a href="${article.link}" class="read-more">Read Article →</a>
      </div>
    </div>
  `).join('');
}

async function searchBooks() {
  const query = document.getElementById('book-search').value.trim();
  const url = query 
    ? `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query + ' mental health')}&maxResults=12`
    : GOOGLE_BOOKS_API;
  const resultsDiv = document.getElementById('books-results');
  resultsDiv.innerHTML = '<p>Loading beautiful books for you...</p>';
  try {
    const res = await fetch(url);
    const data = await res.json();
    const books = data.items || [];
    if (books.length === 0) {
      resultsDiv.innerHTML = '<p>No books found. Try "anxiety", "trauma", or "healing".</p>';
      return;
    }
    resultsDiv.innerHTML = books.map((book, index) => {
      const info = book.volumeInfo;
      const thumbnail = info.imageLinks?.thumbnail || 'https://via.placeholder.com/128x195?text=No+Image';
      const title = info.title || 'No title';
      const authors = info.authors?.join(', ') || 'Unknown author';
      return `
        <div class="book-card">
          <img src="${thumbnail.replace(/"/g, '&quot;')}" alt="${title.replace(/"/g, '&quot;')}">
          <div class="book-info">
            <div class="book-title">${title}</div>
            <div class="book-author">${authors}</div>
            <button class="save-book-btn" data-book-index="${index}">
              ♡ Save Book
            </button>
          </div>
        </div>
      `;
    }).join('');
    
    // Add event listeners to save buttons
    document.querySelectorAll('.save-book-btn').forEach((btn, index) => {
      btn.addEventListener('click', () => {
        const book = books[index];
        const info = book.volumeInfo;
        const thumbnail = info.imageLinks?.thumbnail || 'https://via.placeholder.com/128x195?text=No+Image';
        const title = info.title || 'No title';
        const authors = info.authors?.join(', ') || 'Unknown author';
        saveBook(title, authors, thumbnail);
      });
    });
  } catch (err) {
    resultsDiv.innerHTML = '<p>Sorry, something went wrong. Try again!</p>';
  }
}

// Global function for save button
window.saveBook = (title, author, image) => {
  let saved = JSON.parse(localStorage.getItem('savedBooks') || '[]');
  if (!saved.some(b => b.title === title)) {
    saved.push({ title, author, image, savedAt: new Date().toLocaleDateString() });
    localStorage.setItem('savedBooks', JSON.stringify(saved));
    alert('Book saved! You can review it anytime.');
  } else {
    alert('Already saved!');
  }
};