// js/modules/ui.js
const encouragementMessages = {
  anxious: [
    "It's okay to feel anxious. Try taking 5 slow, deep breaths right now. You're safe.",
    "Anxiety is just a wave — it will pass. You're stronger than this moment.",
    "You're not alone. Thousands of people feel this way and come through it every day.",
    "Be gentle with yourself. This feeling doesn't define you."
  ],
  sad: [
    "It's okay to feel sad. Your emotions are valid and you're allowed to feel them.",
    "Sadness is part of healing. You're doing better than you think.",
    "Even on hard days, you matter. Your story isn't over.",
    "Let the tears come if they need to — crying is healing."
  ],
  stressed: [
    "You've handled tough days before. You can handle this one too.",
    "Close your eyes for 10 seconds and just breathe. You don't have to solve everything right now.",
    "You're doing your best, and that is always enough.",
    "One thing at a time. You've got this."
  ],
  calm: [
    "This calm moment is proof of your strength. Well done for getting here.",
    "Peace lives inside you — and you're feeling it right now. Beautiful.",
    "You created this calm. Be proud of yourself.",
    "Keep protecting this peace. You deserve it."
  ],
  happy: [
    "Yes! Hold onto this joy — you deserve every bit of it.",
    "Your happiness is real and beautiful. Let it shine.",
    "This moment of happiness? It's proof that good things come.",
    "You're glowing. Keep being your amazing self."
  ],
  overwhelmed: [
    "Pause. Breathe. You don't have to do it all right now.",
    "It's okay to feel overwhelmed. Let's take it one tiny step at a time.",
    "You're carrying a lot — and you're still here. That's incredible strength.",
    "You are not failing. You're human. Be kind to yourself."
  ]
};

export function initMoodPrompts() {
  const moodButtons = document.querySelectorAll('.mood-grid button');
  const encouragementEl = document.getElementById('encouragement');

  moodButtons.forEach(button => {
    button.addEventListener('click', () => {
      const mood = button.dataset.mood;
      const messages = encouragementMessages[mood];
      
      // Pick random encouraging message
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      
      encouragementEl.textContent = randomMsg;
      encouragementEl.style.opacity = '0';
      
      // Smooth fade-in animation
      setTimeout(() => {
        encouragementEl.style.transition = 'opacity 0.8s ease';
        encouragementEl.style.opacity = '1';
      }, 100);

      // Visual feedback on button
      moodButtons.forEach(btn => btn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)');
      button.style.boxShadow = '0 0 20px var(--mint-green)';
      button.style.transform = 'scale(1.05)';
      
      setTimeout(() => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
      }, 300);
    });
  });
}