export default function Home() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Welcome to DeFi DApp
          </h1>
          <p className="text-xl text-muted-foreground">
            A teaching platform for decentralized finance applications
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="LaunchPad"
            description="Launch and participate in token sales"
            href="/launchpad"
            icon="🚀"
          />
          <FeatureCard
            title="Bridge"
            description="Transfer assets across chains"
            href="/bridge"
            icon="🌉"
          />
          <FeatureCard
            title="Swap"
            description="Exchange tokens instantly"
            href="/swap"
            icon="🔄"
          />
          <FeatureCard
            title="Pool"
            description="Add/Remove liquidity and earn LP tokens"
            href="/pool"
            icon="💎"
          />
          <FeatureCard
            title="Farm"
            description="Provide liquidity and farm rewards"
            href="/farm"
            icon="🌾"
          />
          <FeatureCard
            title="API Health"
            description="Check API status"
            href="/api/health"
            icon="❤️"
          />
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
