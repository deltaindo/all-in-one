import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Delta Unified - Platform',
  description: 'Delta Indonesia - Unified Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
