'use client'
import { useState, useLayoutEffect, useRef } from 'react';

export default function UseLayoutEffectDemo() {
  const [width, setWidth] = useState(0);
  const divRef = useRef(null);

  useLayoutEffect(() => {
    if (divRef.current) {
      setWidth(divRef.current.offsetWidth);
    }
  });

  return (
    <div style={{ textAlign: 'center', padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>useLayoutEffect 演示</h2>
      <div 
        ref={divRef} 
        style={{ 
          width: '300px', 
          height: '100px', 
          backgroundColor: 'lightblue',
          padding: '20px',
          margin: '20px auto',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: 'bold'
        }}
      >
        这个div的宽度是: {width}px
      </div>
      <p style={{ fontSize: '16px', color: '#666', marginTop: '20px' }}>useLayoutEffect在DOM更新后同步执行</p>
    </div>
  );
}