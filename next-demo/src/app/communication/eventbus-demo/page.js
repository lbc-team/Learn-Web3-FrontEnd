'use client';

import { useState, useEffect } from 'react';

// 简单的事件总线
class SimpleEventBus {
  constructor() {
    this.events = {};
  }

  // 订阅事件
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);

    // 返回取消订阅函数
    return () => {
      this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
    };
  }

  // 发布事件
  emit(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => callback(data));
    }
  }
}

// 全局事件总线实例
const eventBus = new SimpleEventBus();

// 组件A - 发送消息
const ComponentA = () => {
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim()) {
      eventBus.emit('message', input);
      setInput('');
    }
  };

  return (
    <div style={{ padding: '15px', border: '2px solid #9C27B0', margin: '10px' }}>
      <h4>组件A（发送方）</h4>
      <div>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息发送到事件总线"
          style={{ padding: '5px', margin: '5px' }}
        />
        <button 
          onClick={sendMessage}
          style={{ padding: '5px 10px', margin: '5px' }}
        >
          发送消息
        </button>
      </div>
    </div>
  );
};

// 组件B - 接收消息
const ComponentB = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const unsubscribe = eventBus.on('message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return unsubscribe;
  }, []);

  return (
    <div style={{ padding: '15px', border: '2px solid #4CAF50', margin: '10px' }}>
      <h4>组件B（接收方）</h4>
      <p>接收到的消息:</p>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

// 组件C - 另一个接收方
const ComponentC = () => {
  const [lastMessage, setLastMessage] = useState('');

  useEffect(() => {
    const unsubscribe = eventBus.on('message', (message) => {
      setLastMessage(message);
    });

    return unsubscribe;
  }, []);

  return (
    <div style={{ padding: '15px', border: '2px solid #FF9800', margin: '10px' }}>
      <h4>组件C（另一个接收方）</h4>
      <p>最新消息: <strong>{lastMessage || '暂无消息'}</strong></p>
    </div>
  );
};

const EventBusDemo = () => {
  return (
    <div style={{ padding: '20px', border: '2px solid #f44336', margin: '10px' }}>
      <h3>事件总线通信示例</h3>
      <p>组件通过事件总线发布和订阅消息，实现完全解耦的通信</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <ComponentA />
        <div>
          <ComponentB />
          <ComponentC />
        </div>
      </div>
    </div>
  );
};

export default function EventBusDemoPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>事件总线通信</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <a href="/communication" style={{ color: '#2196F3' }}>← 返回Communication首页</a>
      </div>

      <EventBusDemo />
    </div>
  );
}