export default function HooksDemo() {
  return (
    <div style={{ textAlign: 'center', padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>React Hooks 演示</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li style={{ margin: '10px 0' }}><a href="/hooksDemo/useState" style={{ textDecoration: 'none', color: '#0070f3', fontSize: '18px' }}>useState</a></li>
        <li style={{ margin: '10px 0' }}><a href="/hooksDemo/useReducer" style={{ textDecoration: 'none', color: '#0070f3', fontSize: '18px' }}>useReducer</a></li>
        <li style={{ margin: '10px 0' }}><a href="/hooksDemo/useContext" style={{ textDecoration: 'none', color: '#0070f3', fontSize: '18px' }}>useContext</a></li>
        <li style={{ margin: '10px 0' }}><a href="/hooksDemo/useEffect" style={{ textDecoration: 'none', color: '#0070f3', fontSize: '18px' }}>useEffect</a></li>
        <li style={{ margin: '10px 0' }}><a href="/hooksDemo/useMemo" style={{ textDecoration: 'none', color: '#0070f3', fontSize: '18px' }}>useMemo</a></li>
        <li style={{ margin: '10px 0' }}><a href="/hooksDemo/useCallback" style={{ textDecoration: 'none', color: '#0070f3', fontSize: '18px' }}>useCallback</a></li>
        <li style={{ margin: '10px 0' }}><a href="/hooksDemo/useRef" style={{ textDecoration: 'none', color: '#0070f3', fontSize: '18px' }}>useRef</a></li>
        <li style={{ margin: '10px 0' }}><a href="/hooksDemo/useLayoutEffect" style={{ textDecoration: 'none', color: '#0070f3', fontSize: '18px' }}>useLayoutEffect</a></li>
      </ul>
    </div>
  );
}