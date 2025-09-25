'use client';

import { useState } from 'react';

const SimpleChild = ({ onMessage }) => {
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim()) {
      onMessage(input);
      setInput('');
    }
  };

  return (
    <div style={{ padding: '15px', border: '2px solid #9C27B0', margin: '10px' }}>
      <h4>子组件</h4>
      <div>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入要发送的消息"
          style={{ padding: '5px', margin: '5px' }}
        />
        <button 
          onClick={sendMessage}
          style={{ padding: '5px 10px', margin: '5px' }}
        >
          发送到父组件
        </button>
      </div>
    </div>
  );
};

const SimpleParent = () => {
  const [messages, setMessages] = useState([]);

  const handleMessage = (msg) => {
    setMessages(prev => [...prev, msg]);
  };

  return (
    <div style={{ padding: '20px', border: '2px solid #FF9800', margin: '10px' }}>
      <h3>父组件</h3>
      <p>收到的消息: {messages.join(', ')}</p>
      
      <SimpleChild onMessage={handleMessage} />
    </div>
  );
};

export default function CallbackDemoPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>子传父回调函数通信</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <a href="/communication" style={{ color: '#2196F3' }}>← 返回Communication首页</a>
      </div>

      <SimpleParent />

    </div>
  );
}