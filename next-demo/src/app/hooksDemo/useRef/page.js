'use client'
import { useRef, useState } from 'react';

export default function UseRefDemo() {
  const inputRef = useRef(null);
  const countRef = useRef(0);
  const [render, setRender] = useState(0);

  const focusInput = () => {
    inputRef.current.focus();
  };

  const incrementRef = () => {
    countRef.current += 1;
    console.log('ref计数:', countRef.current);
  };

  return (
    <div style={{ textAlign: 'center', padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>useRef 演示</h2>
      <div style={{ margin: '20px 0' }}>
        <input 
          ref={inputRef} 
          placeholder="点击按钮聚焦我" 
          style={{ padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px', width: '200px' }}
        />
      </div>
      <button 
        onClick={focusInput}
        style={{ margin: '10px', padding: '10px 20px', fontSize: '16px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        聚焦输入框
      </button>
      <p style={{ fontSize: '18px', margin: '20px 0' }}>ref计数 (不会触发重渲染): {countRef.current}</p>
      <button 
        onClick={incrementRef}
        style={{ margin: '10px', padding: '10px 20px', fontSize: '16px', backgroundColor: '#f50057', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        增加ref计数
      </button>
      <p style={{ fontSize: '18px', margin: '20px 0' }}>渲染次数: {render}</p>
      <button 
        onClick={() => setRender(render + 1)}
        style={{ margin: '10px', padding: '10px 20px', fontSize: '16px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        重新渲染
      </button>
    </div>
  );
}