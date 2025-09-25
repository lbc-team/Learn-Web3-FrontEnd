'use client';

import { createContext, useContext, useState } from 'react';

// 创建简单的Message Context
const MessageContext = createContext();

// Context Provider组件
const MessageProvider = ({ children }) => {
  const [message, setMessage] = useState('Hello from Context!');
  
  return (
    <MessageContext.Provider value={{ message, setMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

// 深层子组件
const DeepChild = () => {
  const { message, setMessage } = useContext(MessageContext);
  
  return (
    <div style={{ padding: '15px', border: '2px solid #9C27B0', margin: '10px' }}>
      <h4>深层子组件（Level 3）</h4>
      <p>从Context获取的消息: <strong>{message}</strong></p>
      <input 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="修改Context中的消息"
        style={{ padding: '5px', margin: '5px' }}
      />
    </div>
  );
};

// 中层组件（不使用Context）
const MiddleComponent = () => {
  return (
    <div style={{ padding: '15px', border: '2px solid #4CAF50', margin: '10px' }}>
      <h4>中层组件（Level 2）</h4>
      <p>我不使用Context，只是传递层</p>
      <DeepChild />
    </div>
  );
};

// 顶层组件
const TopComponent = () => {
  const { message } = useContext(MessageContext);
  
  return (
    <div style={{ padding: '15px', border: '2px solid #2196F3', margin: '10px' }}>
      <h4>顶层组件（Level 1）</h4>
      <p>当前Context消息: <strong>{message}</strong></p>
      <MiddleComponent />
    </div>
  );
};

const ContextDemo = () => {
  return (
    <MessageProvider>
      <div style={{ padding: '20px', border: '2px solid #FF9800', margin: '10px' }}>
        <h3>Context示例</h3>
        <p>深层组件可以直接获取和修改顶层数据，无需通过中间层传递</p>
        <TopComponent />
      </div>
    </MessageProvider>
  );
};

export default function ContextDemoPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Context深层传递通信</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <a href="/communication" style={{ color: '#2196F3' }}>← 返回Communication首页</a>
      </div>

      <ContextDemo />
    </div>
  );
}