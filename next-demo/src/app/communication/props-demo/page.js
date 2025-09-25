'use client';

import { useState } from 'react';

const SimpleChild = ({ message, count }) => {
  return (
    <div style={{ padding: '15px', border: '2px solid #2196F3', margin: '10px' }}>
      <h4>子组件</h4>
      <p>接收到的消息: {message}</p>
      <p>接收到的计数: {count}</p>
    </div>
  );
};

const SimpleParent = () => {
  const [message, setMessage] = useState('Hello from Parent!');
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', border: '2px solid #4CAF50', margin: '10px' }}>
      <h3>父组件</h3>
      <div>
        <input 
          value={message} 
          onChange={(e) => setMessage(e.target.value)}
          placeholder="修改传递给子组件的消息"
          style={{ padding: '5px', margin: '5px' }}
        />
        <button 
          onClick={() => setCount(count + 1)}
          style={{ padding: '5px 10px', margin: '5px' }}
        >
          计数: {count}
        </button>
      </div>
      
      <SimpleChild message={message} count={count} />
    </div>
  );
};

export default function PropsDemoPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>父传子Props通信</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <a href="/communication" style={{ color: '#2196F3' }}>← 返回Communication首页</a>
      </div>

      <SimpleParent />
    </div>
  );
}