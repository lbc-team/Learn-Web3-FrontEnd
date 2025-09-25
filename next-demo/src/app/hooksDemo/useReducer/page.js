'use client'
import { useReducer } from 'react';

function reducer(state, action) {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    case 'decrement': return { count: state.count - 1 };
    default: return state;
  }
}

export default function UseReducerDemo() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div style={{ textAlign: 'center', padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>useReducer 演示</h2>
      <p style={{ fontSize: '24px', margin: '20px 0' }}>计数: {state.count}</p>
      <button 
        onClick={() => dispatch({ type: 'increment' })}
        style={{ margin: '10px', padding: '10px 20px', fontSize: '16px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        +1
      </button>
      <button 
        onClick={() => dispatch({ type: 'decrement' })}
        style={{ margin: '10px', padding: '10px 20px', fontSize: '16px', backgroundColor: '#f50057', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        -1
      </button>
    </div>
  );
}