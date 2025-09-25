'use client'
import { useState, useMemo } from 'react';

export default function UseMemoDemo() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  const expensiveValue = useMemo(() => {
    console.log('计算昂贵的值');
    return count * 100;
  }, [count]);

  return (
    <div style={{ textAlign: 'center', padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>useMemo 演示</h2>
      <p style={{ fontSize: '20px', margin: '15px 0' }}>计数: {count}</p>
      <p style={{ fontSize: '20px', margin: '15px 0' }}>昂贵计算结果: {expensiveValue}</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{ margin: '10px', padding: '10px 20px', fontSize: '16px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        +1
      </button>
      <br />
      <input 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        placeholder="输入文本不会重新计算"
        style={{ margin: '20px 0', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px', width: '250px' }}
      />
      <p style={{ fontSize: '18px', margin: '10px 0' }}>文本: {text}</p>
    </div>
  );
}