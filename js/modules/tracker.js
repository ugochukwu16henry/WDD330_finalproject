// js/modules/tracker.js
let moodChart, sleepEnergyChart;

const moodEmojis = {
  happy: '😊', calm: '😌', okay: '😐', sad: '😔', anxious: '😰'
};

const moodValues = {
  happy: 5, calm: 4, okay: 3, sad: 2, anxious: 1
};

document.addEventListener('DOMContentLoaded', () => {
  setupMoodButtons();
  setupEnergySlider();
  setupForm();
  loadEntries();
  renderCharts();
});

function setupMoodButtons() {
  document.querySelectorAll('.mood-select button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mood-select button').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      document.getElementById('selected-mood').value = btn.dataset.mood;
    });
  });
}

function setupEnergySlider() {
  const slider = document.getElementById('energy');
  const value = document.getElementById('energy-value');
  slider.addEventListener('input', () => value.textContent = slider.value);
}

function setupForm() {
  document.getElementById('wellness-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const entry = {
      date: new Date().toISOString().split('T')[0],
      mood: document.getElementById('selected-mood').value,
      moodValue: moodValues[document.getElementById('selected-mood').value],
      sleep: parseFloat(document.getElementById('sleep').value),
      energy: parseInt(document.getElementById('energy').value),
      gratitude: document.getElementById('gratitude').value.trim() || 'No gratitude entry',
      timestamp: new Date().toISOString()
    };

    let entries = JSON.parse(localStorage.getItem('wellnessEntries') || '[]');
    
    // Remove today's entry if exists (update)
    entries = entries.filter(e => e.date !== entry.date);
    entries.push(entry);
    
    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    entries = entries.filter(e => new Date(e.date) >= thirtyDaysAgo);
    
    localStorage.setItem('wellnessEntries', JSON.stringify(entries));
    
    alert('Entry saved! You are growing every day. 🌱');
    e.target.reset();
    document.querySelectorAll('.mood-select button').forEach(b => b.classList.remove('selected'));
    loadEntries();
    renderCharts();
  });
}

function loadEntries() {
  const entries = JSON.parse(localStorage.getItem('wellnessEntries') || '[]');
  const list = document.getElementById('entries-list');
  
  if (entries.length === 0) {
    list.innerHTML = '<p style="text-align:center; color:#888;">No entries yet. Start logging today!</p>';
    return;
  }

  entries.sort((a, b) => b.date.localeCompare(a.date));
  
  list.innerHTML = entries.map(e => `
    <div class="entry">
      <strong>${new Date(e.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong>
      <span style="margin-left: 1rem;">${moodEmojis[e.mood]} ${e.mood}</span>
      <br>Sleep: ${e.sleep}h | Energy: ${e.energy}/10
      <br><em>"${e.gratitude}"</em>
    </div>
  `).join('');
}

function renderCharts() {
  const entries = JSON.parse(localStorage.getItem('wellnessEntries') || '[]')
    .sort((a, b) => a.date.localeCompare(b.date));

  const last7 = entries.slice(-7);

  const labels = last7.map(e => new Date(e.date).toLocaleDateString('en', { weekday: 'short' }));
  const moodData = last7.map(e => e.moodValue);
  const sleepData = last7.map(e => e.sleep);
  const energyData = last7.map(e => e.energy);

  // Destroy old charts
  if (moodChart) moodChart.destroy();
  if (sleepEnergyChart) sleepEnergyChart.destroy();

  moodChart = new Chart(document.getElementById('moodChart'), {
    type: 'line',
    data: {
      labels: labels.length ? labels : ['No data'],
      datasets: [{
        label: 'Mood',
        data: moodData,
        borderColor: '#7ec8e3',
        backgroundColor: 'rgba(126, 200, 227, 0.2)',
        tension: 0.4,
        fill: true
      }]
    },
    options: { responsive: true, scales: { y: { min: 0, max: 5 } } }
  });

  sleepEnergyChart = new Chart(document.getElementById('sleepEnergyChart'), {
    type: 'bar',
    data: {
      labels: labels.length ? labels : ['No data'],
      datasets: [
        {
          label: 'Sleep (hours)',
          data: sleepData,
          backgroundColor: '#b4e2c8'
        },
        {
          label: 'Energy',
          data: energyData,
          backgroundColor: '#d8c7ff'
        }
      ]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });
}