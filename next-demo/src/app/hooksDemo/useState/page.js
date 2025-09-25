'use client'
import { useState } from 'react';

export default function UseStateDemo() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ textAlign: 'center', padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>useState 演示</h2>
      <p style={{ fontSize: '24px', margin: '20px 0' }}>计数: {count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{ margin: '10px', padding: '10px 20px', fontSize: '16px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        +1
      </button>
      <button 
        onClick={() => setCount(count - 1)}
        style={{ margin: '10px', padding: '10px 20px', fontSize: '16px', backgroundColor: '#f50057', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        -1
      </button>
    </div>
  );
}