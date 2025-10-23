import styles from "./page.module.css";
import Demo from "@/app/JsxDemo/Demo";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Demo />
        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="/communication"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0070f3',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
          >
            React组件通信教学
          </a>
          <a
            className={styles.primary}
            href="/hooksDemo"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0070f3',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
          >
            React Hooks 教学
          </a>
          <a
            className={styles.primary}
            href="/ConnectRpc"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#10b981',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
          >
            Web3 RPC连接演示
          </a>
          {/* <a
            className={styles.primary}
            href="/viemDemo"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f59e0b',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
          >
            Viem使用教学
          </a>
          <a
            className={styles.primary}
            href="/wagmiDemo"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
          >
            Wagmi使用教学
          </a>
          <a
            className={styles.primary}
            href="/connectWalletDemo"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ec4899',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
          >
            钱包连接工具演示
          </a> */}
        </div>
      </main>
    </div>
  );
}
