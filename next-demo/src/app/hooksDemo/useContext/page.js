'use client'
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

function Child() {
  const theme = useContext(ThemeContext);
  return <p style={{ fontSize: '20px', margin: '20px 0' }}>当前主题: {theme}</p>;
}

export default function UseContextDemo() {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={theme}>
      <div style={{ textAlign: 'center', padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
        <h2>useContext 演示</h2>
        <Child />
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          style={{ margin: '20px', padding: '10px 20px', fontSize: '16px', backgroundColor: '#0070f3', color: theme === 'light' ? 'white' : 'black', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          切换主题
        </button>
      </div>
    </ThemeContext.Provider>
  );
}