import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Landmark, LayoutDashboard, LogOut, PiggyBank, ShoppingBag, WalletCards } from 'lucide-react'

export const money = (amount: number) => `UGX ${Math.round(amount).toLocaleString('en-UG')}`

export function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="logo" aria-label="E-SACCO"><span>E-</span><strong>SACCO</strong>{!compact && <small>Save. Finance. Cook Clean.</small>}</div>
}

export function Pill({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'green' | 'orange' | 'grey' }) {
  return <span className={`pill pill-${tone}`}>{children}</span>
}

export function Progress({ value }: { value: number }) {
  return <div className="progress" aria-label={`${value}% complete`}><span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>
}

export function PublicShell({ children }: { children: ReactNode }) {
  const nav = [
    ['/', 'Home', Home], ['/save', 'Save', PiggyBank], ['/marketplace', 'Marketplace', ShoppingBag],
    ['/loan', 'Loan', WalletCards], ['/services', 'Zimba SACCO', Landmark],
  ] as const
  return <div className="app-shell">
    <header className="topbar">
      <NavLink to="/" className="brand-link"><Logo /></NavLink>
      <div className="partner-line"><span>Approved SACCO: <b>Zimba SACCO</b></span><span>Technology partner: <b>Vermaak</b></span></div>
      <NavLink to="/admin" className="admin-link"><LayoutDashboard size={17}/> CMS</NavLink>
    </header>
    <main className="page">{children}</main>
    <nav className="mobile-nav" aria-label="Primary">
      {nav.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'}><Icon size={21}/><span>{label}</span></NavLink>)}
    </nav>
    <footer><div><Logo compact /></div><p>NREP programme initiative · Financial services by Zimba SACCO · Technology by Vermaak</p></footer>
  </div>
}

export function AdminShell({ children, onLogout }: { children: ReactNode; onLogout: () => void }) {
  return <div className="admin-shell">
    <aside className="admin-sidebar"><Logo /><p>Content Management</p><NavLink to="/admin">Dashboard</NavLink><NavLink to="/">View public app</NavLink><button onClick={onLogout}><LogOut size={17}/> Sign out</button></aside>
    <main className="admin-main">{children}</main>
  </div>
}
