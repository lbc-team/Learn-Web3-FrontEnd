'use client'
import { useState, useEffect } from 'react';

export default function UseEffectDemo() {
  const [count, setCount] = useState(0);
  const [title, setTitle] = useState('useEffect演示');

  useEffect(() => {
    document.title = `计数: ${count}`;
  }, [count]);

  useEffect(() => {
    console.log('组件挂载');
    return () => console.log('组件卸载');
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>{title}</h2>
      <p style={{ fontSize: '24px', margin: '20px 0' }}>计数: {count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{ margin: '10px', padding: '10px 20px', fontSize: '16px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        +1
      </button>
      <p style={{ fontSize: '14px', color: '#666', marginTop: '20px' }}>查看浏览器标题变化</p>
    </div>
  );
}