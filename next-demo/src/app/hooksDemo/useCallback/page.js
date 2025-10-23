'use client'
import { useState, useCallback, memo } from 'react';

const Child = memo(({ onClick, label }) => {
  console.log(`${label} 子组件渲染`);
  return (
    <button 
      onClick={onClick}
      style={{ margin: '10px', padding: '10px 15px', fontSize: '14px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
    >
      {label}
    </button>
  );
});

export default function UseCallbackDemo() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  const handleIncrement = useCallback(() => {
    setCount(prev => prev + 1);
    console.log("使用了useCallback的函数");
  }, []);

  const handleTextChange = () => {
    setText(text + '!');
    console.log("没有使用useCallback的函数");
  };

  return (
    <div style={{ textAlign: 'center', padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>useCallback 演示</h2>
      <p style={{ fontSize: '20px', margin: '15px 0' }}>计数: {count}</p>
      <p style={{ fontSize: '20px', margin: '15px 0' }}>文本: {text}</p>
      <div style={{ margin: '20px 0' }}>
        <Child onClick={handleIncrement} label="使用useCallback" />
        <Child onClick={handleTextChange} label="普通函数" />
      </div>
      <input 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        placeholder="输入文本试试"
        style={{ margin: '20px 0', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px', width: '200px' }}
      />
      <p style={{ fontSize: '14px', color: '#666' }}>打开控制台查看渲染次数</p>
    </div>
  );
}