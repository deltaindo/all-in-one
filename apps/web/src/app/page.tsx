import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>🎉 Delta Unified Platform</h1>
      <p>Welcome to the unified Delta Indonesia platform</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Available Modules:</h2>
        <ul>
          <li>
            <Link href="/dashboard/pic">📡 PIC Monitoring Dashboard</Link>
          </li>
          <li>
            <Link href="/dashboard/crm">💬 CRM Blaster</Link>
          </li>
          <li>
            <Link href="/dashboard/inventory">📦 Inventory Management</Link>
          </li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem', color: '#666' }}>
        <p>Status: ✅ Monorepo structure initialized</p>
        <p>Database: 🗄️ Prisma ready (run 'npm run db:migrate')</p>
        <p>API: 🔌 Shared packages configured</p>
      </div>
    </div>
  );
}
