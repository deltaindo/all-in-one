export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav style={{ 
        padding: '1rem', 
        backgroundColor: '#f0f0f0',
        borderBottom: '1px solid #ddd'
      }}>
        <div>Dashboard Navigation</div>
      </nav>
      {children}
    </div>
  );
}
