export default function Home() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Welcome to Web3 DAPP Demo
          </h1>
          <p className="text-xl text-muted-foreground">
            A step-by-step tutorial platform for building DeFi applications
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            从 Day1 到 Day6，循序渐进学习 Web3 DAPP 开发
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Day 1"
            description="项目概览与初始化"
            href="/day1/day1.md"
            icon="📚"
          />
          <FeatureCard
            title="Day 2"
            description="DEX 核心页面（Swap, Pool, Farms）"
            href="/day2/day2.md"
            icon="🔄"
          />
          <FeatureCard
            title="Day 3"
            description="高级页面（LaunchPad, Dashboard, Bridge）"
            href="/day3/day3.md"
            icon="🚀"
          />
          <FeatureCard
            title="Day 4"
            description="钱包连接实现"
            href="/day4/day4.md"
            icon="👛"
          />
          <FeatureCard
            title="Day 5"
            description="DAPP 交互 - 交易和签名"
            href="/day5/day5.md"
            icon="✍️"
          />
          <FeatureCard
            title="Day 6"
            description="DAPP 交互 - 数据查询"
            href="/day6/day6.md"
            icon="📊"
          />
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">完整功能演示</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <DemoCard title="Swap" href="/swap" icon="🔄" />
            <DemoCard title="Pool" href="/pool" icon="💎" />
            <DemoCard title="Farm" href="/farm" icon="🌾" />
            <DemoCard title="LaunchPad" href="/launchpad" icon="🚀" />
            <DemoCard title="Dashboard" href="/dashboard" icon="📊" />
            <DemoCard title="Bridge" href="/bridge" icon="🌉" />
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ title, description, href, icon }) {
  return (
    <a
      href={href}
      className="group relative overflow-hidden rounded-lg border p-6 hover:shadow-lg transition-all hover:border-primary"
    >
      <div className="flex flex-col gap-2">
        <div className="text-4xl mb-2">{icon}</div>
        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </a>
  )
}

function DemoCard({ title, href, icon }) {
  return (
    <a
      href={href}
      className="group relative overflow-hidden rounded-lg border p-4 hover:shadow-md transition-all hover:border-primary"
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <h3 className="font-semibold group-hover:text-primary transition-colors">
          {title}
        </h3>
      </div>
    </a>
  )
}
