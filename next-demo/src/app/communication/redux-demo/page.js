'use client';

import { useState } from 'react';
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { Provider, useSelector, useDispatch } from 'react-redux';

// 1. 创建Redux Slice
const messageSlice = createSlice({
  name: 'message',
  initialState: {
    text: 'Hello from Redux!'
  },
  reducers: {
    setMessage: (state, action) => {
      state.text = action.payload;
    }
  }
});

// 2. 导出Actions
export const { setMessage } = messageSlice.actions;

// 3. 创建Store
const store = configureStore({
  reducer: {
    message: messageSlice.reducer
  }
});

// 组件A - 发送方
const ComponentA = () => {
  const [input, setInput] = useState('');
  const dispatch = useDispatch();

  const sendMessage = () => {
    if (input.trim()) {
      dispatch(setMessage(input));
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
          placeholder="输入消息发送到Redux Store"
          style={{ padding: '5px', margin: '5px' }}
        />
        <button 
          onClick={sendMessage}
          style={{ padding: '5px 10px', margin: '5px' }}
        >
          发送到Store
        </button>
      </div>
    </div>
  );
};

// 组件B - 接收方
const ComponentB = () => {
  const message = useSelector(state => state.message.text);

  return (
    <div style={{ padding: '15px', border: '2px solid #4CAF50', margin: '10px' }}>
      <h4>组件B（接收方）</h4>
      <p>从Redux Store获取的消息: <strong>{message}</strong></p>
    </div>
  );
};

// 组件C - 另一个接收方
const ComponentC = () => {
  const message = useSelector(state => state.message.text);

  return (
    <div style={{ padding: '15px', border: '2px solid #FF9800', margin: '10px' }}>
      <h4>组件C（另一个接收方）</h4>
      <p>同样的消息: <strong>{message}</strong></p>
    </div>
  );
};

// Redux Demo内容组件
const ReduxDemoContent = () => {
  return (
    <div style={{ padding: '20px', border: '2px solid #2196F3', margin: '10px' }}>
      <h3>Redux全局状态管理示例</h3>
      <p>所有组件都可以通过useSelector访问Store，通过useDispatch更新状态</p>
      
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

// 主组件，包装Provider
const ReduxDemo = () => {
  return (
    <Provider store={store}>
      <ReduxDemoContent />
    </Provider>
  );
};

export default function ReduxDemoPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Redux全局状态管理</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <a href="/communication" style={{ color: '#2196F3' }}>← 返回Communication首页</a>
      </div>

      <ReduxDemo />

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f3e5f5', border: '1px solid #9C27B0' }}>
        <h3>学习要点:</h3>
        <ul>
          <li><strong>Redux Toolkit:</strong> 现代Redux开发的推荐方式，简化了配置</li>
          <li><strong>createSlice:</strong> 自动生成action creators和reducers</li>
          <li><strong>useSelector:</strong> 从Store中选择需要的状态数据</li>
          <li><strong>useDispatch:</strong> 获取dispatch函数来发送actions</li>
          <li><strong>Provider:</strong> 为整个应用提供Store访问</li>
        </ul>
        
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 5px 0', color: '#856404' }}>代码结构:</h4>
          <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
            <div>1. createSlice() - 定义状态和reducers</div>
            <div>2. configureStore() - 创建Redux store</div>
            <div>3. Provider - 包装应用提供store</div>
            <div>4. useSelector() - 读取状态</div>
            <div>5. useDispatch() - 发送actions</div>
          </div>
        </div>
      </div>
    </div>
  );
}