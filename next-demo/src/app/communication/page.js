'use client';

export default function CommunicationHomePage() {
  const demos = [
    {
      id: 'props-demo',
      name: '父传子Props通信',
      description: '学习React中最基础的组件通信方式，通过props将数据从父组件传递给子组件',
      color: '#4CAF50'
    },
    {
      id: 'callback-demo', 
      name: '子传父回调函数通信',
      description: '学习子组件如何通过回调函数向父组件传递数据和触发事件',
      color: '#FF9800'
    },
    {
      id: 'context-demo',
      name: 'Context深层传递通信', 
      description: '学习使用React Context API解决props drilling问题',
      color: '#2196F3'
    },
    {
      id: 'redux-demo',
      name: 'Redux全局状态管理',
      description: '学习使用Redux实现不相关组件间的状态共享和通信',
      color: '#9C27B0'
    },
    {
      id: 'eventbus-demo',
      name: '事件总线通信',
      description: '学习使用事件发布订阅模式实现完全解耦的组件通信',
      color: '#f44336'
    }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>React组件通信教学</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <a href="/" style={{ color: '#2196F3', textDecoration: 'none' }}>← 返回首页</a>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {demos.map((demo, index) => (
          <div
            key={demo.id}
            style={{
              border: `2px solid ${demo.color}`,
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: 'white'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: demo.color, margin: '0 0 10px 0' }}>
                  {index + 1}. {demo.name}
                </h3>
                <p style={{ margin: '0 0 15px 0', color: '#666' }}>
                  {demo.description}
                </p>
              </div>
            </div>
            
            <a
              href={`/communication/${demo.id}`}
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: demo.color,
                color: 'white',
                textDecoration: 'none',
                borderRadius: '5px',
                fontSize: '14px'
              }}
            >
              开始学习 →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}