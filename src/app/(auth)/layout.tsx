export const dynamic = 'force-dynamic'

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div className="app-bg min-h-screen">{children}</div>
}
