import React, { useState } from 'react';

export default function App() {
  const [theme, setTheme] = useState('Introductions');
  const [checkpoint, setCheckpoint] = useState(0);

  const themes = [
    {
      name: 'Introductions',
      lessons: [
        { ro: 'Bună', en: 'Hello' },
        { ro: 'Cum te cheamă?', en: 'What is your name?' },
        { ro: 'Mă cheamă Ana', en: 'My name is Ana' }
      ]
    },
    {
      name: 'Food & Drinks',
      lessons: [
        { ro: 'Apă', en: 'Water' },
        { ro: 'Pâine', en: 'Bread' },
        { ro: 'Cafea', en: 'Coffee' }
      ]
    }
  ];

  const currentTheme = themes.find(t => t.name === theme);
  const currentLesson = currentTheme.lessons[checkpoint];

  const nextLesson = () => {
    if (checkpoint < currentTheme.lessons.length - 1) {
      setCheckpoint(checkpoint + 1);
    } else {
      alert('You finished this theme!');
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <h1>Romanian Immersive Learning</h1>

      <div>
        <label htmlFor="theme">Choose a theme: </label>
        <select
          id="theme"
          value={theme}
          onChange={e => {
            setTheme(e.target.value);
            setCheckpoint(0);
          }}
        >
          {themes.map(t => (
            <option key={t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h2>Lesson {checkpoint + 1} / {currentTheme.lessons.length}</h2>
        <p><strong>Romanian:</strong> {currentLesson.ro}</p>
        <p><strong>English:</strong> {currentLesson.en}</p>
        <button onClick={nextLesson}>Next</button>
      </div>
    </div>
  );
}
