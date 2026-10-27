import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import {
  ArrowRight, BadgeCheck, Banknote, Bell, BookOpenCheck, ChevronRight, CircleDollarSign, CreditCard,
  ExternalLink, HandCoins, Headphones, Landmark, LockKeyhole, Megaphone, Pencil, Plus, ReceiptText,
  Save, Search, ShieldCheck, ShoppingBag, Sparkles, Trash2, Users, WalletCards, Zap,
} from 'lucide-react'
import { demoCms, transactions } from './data/demo'
import { loadCms, saveCms, signInAdmin, signOutAdmin } from './lib/cms'
import { supabase, supabaseEnabled } from './lib/supabase'
import type { Announcement, CmsState, Product } from './types'
import { AdminShell, Logo, money, Pill, Progress, PublicShell } from './components/Ui'

const cloneDemo = () => JSON.parse(JSON.stringify(demoCms)) as CmsState

function useCms() {
  const [state, setState] = useState<CmsState>(cloneDemo())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { loadCms().then(setState).catch(err => setError(err.message || 'Could not load CMS content.')).finally(() => setLoading(false)) }, [])
  return { state, setState, loading, error }
}

function HomePage({ cms }: { cms: CmsState }) {
  const goal = 420000, target = 850000, percent = Math.round(goal / target * 100)
  return <PublicShell>
    {cms.announcements.filter(item => item.active).slice(0, 1).map(item => <div className={`announcement announcement-${item.level}`} key={item.id}><Megaphone size={20}/><div><b>{item.title}</b><p>{item.body}</p></div></div>)}
    <section className="hero-grid">
      <div className="hero-copy"><Pill tone="orange">Zimba SACCO member platform</Pill><h1>{cms.content.heroTitle}</h1><p>{cms.content.heroSubtitle}</p><div className="hero-actions"><a className="button primary" href="/marketplace">Browse appliances <ArrowRight size={18}/></a><a className="button secondary" href="/save">Start saving</a></div><div className="trust-row"><ShieldCheck size={18}/> Savings and credit decisions are managed by Zimba SACCO.</div></div>
      <div className="dashboard-card">
        <div className="card-heading"><div><small>Good afternoon</small><h2>Sarah Namusoke</h2></div><Bell size={22}/></div>
        <div className="balance-card"><span>Savings balance</span><strong>{money(680000)}</strong></div>
        <div className="goal-summary"><div className="row"><span>E-Cooking Goal</span><b>{percent}%</b></div><h3>{money(goal)} <small>of {money(target)}</small></h3><Progress value={percent}/></div>
        <div className="metric-grid"><div><span>Loan balance</span><b>{money(310000)}</b></div><div><span>Next payment</span><b>{money(75000)}</b><small>15 Nov 2026</small></div></div>
      </div>
    </section>
    <section className="section"><div className="section-title"><div><span className="eyebrow">How it works</span><h2>A responsible path from saving to ownership</h2></div></div><div className="steps">
      {[[PiggyBankIcon,'Save','Build a consistent appliance goal.'],[BadgeCheck,'Qualify','Receive an indicative assessment; Zimba SACCO makes the final decision.'],[ShoppingBag,'Choose','Compare approved products, prices and warranties.'],[Zap,'Cook clean','Pay through EventSuite and receive onboarding and support.']].map(([Icon,title,text],i) => { const C = Icon as typeof Zap; return <article key={String(title)}><span>{i+1}</span><C/><h3>{String(title)}</h3><p>{String(text)}</p></article> })}
    </div></section>
    <section className="section"><div className="section-title"><div><span className="eyebrow">Featured appliances</span><h2>Approved clean-cooking options</h2></div><a href="/marketplace">View all <ChevronRight size={17}/></a></div><div className="product-grid">{cms.products.filter(p => p.active && p.featured).map(product => <ProductCard key={product.id} product={product}/>)}</div></section>
  </PublicShell>
}

function PiggyBankIcon() { return <CircleDollarSign/> }

function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate()
  return <article className="product-card"><div className="product-image" style={{ backgroundImage: `url(${product.imageUrl})` }}><Pill tone="green">Approved</Pill></div><div className="product-body"><span className="eyebrow">{product.category}</span><h3>{product.name}</h3><p>{product.description}</p><div className="specs"><span>{product.capacity}</span><span>{product.powerRating}</span><span>{product.warranty}</span></div><div className="product-price"><strong>{money(product.price)}</strong><small>From {money(product.installment)}/month</small></div><button className="button primary full" onClick={() => navigate(`/marketplace?product=${product.id}`)}>View and pay <ArrowRight size={17}/></button></div></article>
}

function SavePage() {
  const [amount, setAmount] = useState('50000')
  return <PublicShell><div className="page-heading"><div><span className="eyebrow">Savings and goals</span><h1>Save towards your appliance</h1><p>Choose a payment channel and build your E-Cooking Goal.</p></div><Pill tone="green">Balance: {money(680000)}</Pill></div>
    <div className="two-column"><section className="panel"><h2>Make a deposit</h2><label>Amount (UGX)<input type="number" min="1000" value={amount} onChange={e => setAmount(e.target.value)}/></label><div className="payment-methods">{[['MTN Mobile Money',CreditCard],['Airtel Money',CreditCard],['Bank transfer',Landmark],['Zimba SACCO transfer',HandCoins]].map(([label,Icon]) => { const C=Icon as typeof CreditCard; return <button key={String(label)}><C/><span>{String(label)}</span><ChevronRight/></button> })}</div><div className="notice"><LockKeyhole size={19}/><p>Payment channel connections are placeholders until the respective integrations are approved.</p></div></section>
    <section className="panel"><h2>E-Cooking Savings Goal</h2><div className="goal-large"><span>Electric Pressure Cooker</span><strong>{money(420000)} <small>of {money(850000)}</small></strong><Progress value={49}/><div><span>49% achieved</span><span>{money(430000)} remaining</span></div></div><h3>Recent savings</h3><div className="transaction-list">{transactions.map(item => <div key={item.id}><ReceiptText/><span><b>{item.description}</b><small>{item.date}</small></span><strong>+{money(item.amount)}</strong></div>)}</div></section></div>
  </PublicShell>
}

function MarketplacePage({ cms }: { cms: CmsState }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Product | null>(null)
  const products = cms.products.filter(p => p.active && (p.name + p.category).toLowerCase().includes(search.toLowerCase()))
  const startPayment = (product: Product) => {
    const url = product.paymentUrl || cms.content.defaultPaymentUrl
    if (!/^https:\/\//i.test(url)) return alert('This product does not yet have a valid HTTPS EventSuite payment link.')
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  return <PublicShell><div className="page-heading"><div><span className="eyebrow">Approved marketplace</span><h1>Choose your e-cooking appliance</h1><p>Compare prices, capacity, power rating, warranties and payment options.</p></div><div className="search-box"><Search/><input placeholder="Search appliances" value={search} onChange={e => setSearch(e.target.value)}/></div></div>
    <div className="product-grid">{products.map(product => <article className="product-card" key={product.id}><div className="product-image" style={{ backgroundImage: `url(${product.imageUrl})` }}><Pill tone="green">Approved</Pill></div><div className="product-body"><span className="eyebrow">{product.category}</span><h3>{product.name}</h3><p>{product.description}</p><div className="specs"><span>{product.capacity}</span><span>{product.powerRating}</span><span>{product.warranty}</span></div><div className="product-price"><strong>{money(product.price)}</strong><small>Deposit {money(product.deposit)}</small></div><div className="card-actions"><button className="button secondary" onClick={() => setSelected(product)}>Details</button><button className="button primary" onClick={() => startPayment(product)}>Pay via EventSuite <ExternalLink size={16}/></button></div></div></article>)}</div>
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="modal" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setSelected(null)}>×</button><Pill tone="green">Approved by programme catalogue</Pill><h2>{selected.name}</h2><p>{selected.description}</p><dl><div><dt>Cash price</dt><dd>{money(selected.price)}</dd></div><div><dt>Indicative deposit</dt><dd>{money(selected.deposit)}</dd></div><div><dt>Indicative monthly payment</dt><dd>{money(selected.installment)}</dd></div><div><dt>Warranty</dt><dd>{selected.warranty}</dd></div></dl><div className="notice"><ShieldCheck/><p>Payment opens the exact EventSuite link maintained in the CMS. Confirmation and reconciliation require an approved EventSuite callback or administrative verification.</p></div><button className="button primary full" onClick={() => startPayment(selected)}>Continue to EventSuite <ExternalLink size={17}/></button></div></div>}
  </PublicShell>
}

function LoanPage() {
  return <PublicShell><div className="page-heading"><div><span className="eyebrow">Responsible credit</span><h1>Eligibility and loan management</h1><p>Understand the indicative position before submitting an application to Zimba SACCO.</p></div><Pill tone="blue">Final approval: Zimba SACCO</Pill></div>
    <div className="two-column"><section className="panel eligibility"><BadgeCheck/><span>Indicative eligible amount</span><strong>{money(700000)}</strong><div className="rule"></div><h3>Factors currently met</h3>{['Active Zimba SACCO member','Consistent savings activity','No overdue loan balance','Deposit threshold nearly reached'].map(item => <p className="check" key={item}><BadgeCheck size={18}/>{item}</p>)}<div className="notice"><ShieldCheck/><p>This is not a credit offer. Zimba SACCO completes KYC, affordability and policy checks before a final decision.</p></div></section>
    <section className="panel"><h2>My active loan</h2><Pill tone="green">On track</Pill><div className="loan-total"><span>Outstanding balance</span><strong>{money(310000)}</strong></div><Progress value={48}/><div className="metric-grid"><div><span>Amount repaid</span><b>{money(290000)}</b></div><div><span>Next instalment</span><b>{money(75000)}</b><small>15 Nov 2026</small></div></div><button className="button primary full">Make a repayment</button><button className="button secondary full">View repayment schedule</button></section></div>
  </PublicShell>
}

function ServicesPage({ cms }: { cms: CmsState }) {
  return <PublicShell><div className="page-heading"><div><span className="eyebrow">Member services</span><h1>Zimba SACCO and support</h1><p>Manage shares, statements, guarantees, referrals and support requests.</p></div></div><div className="service-grid">
    {[[Landmark,'Zimba SACCO account','Membership ZS-100245 · Verified'],[Banknote,'Shares and dividends',`${money(1250000)} shares · ${money(87500)} dividends`],[Users,'Group savings','Upendo Women Group · 60% of goal'],[HandCoins,'Request a guarantor','Start a consent-based guarantee request'],[Sparkles,'Fumba Hub referral','Referral FH-2026-004783 · Under review'],[BookOpenCheck,'Financial education','6 short lessons on saving, credit and safe e-cooking'],[Headphones,'Support',`${cms.content.supportPhone} · ${cms.content.supportEmail}`]].map(([Icon,title,text]) => { const C=Icon as typeof Landmark; return <article key={String(title)}><C/><div><h3>{String(title)}</h3><p>{String(text)}</p></div><ChevronRight/></article> })}
  </div></PublicShell>
}

function AdminPage({ cms, setCms }: { cms: CmsState; setCms: (next: CmsState) => void }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState<'products'|'content'|'announcements'>('products')
  const [status, setStatus] = useState('')
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setAuthenticated(Boolean(data.session)))
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setAuthenticated(Boolean(session)))
    return () => data.subscription.unsubscribe()
  }, [])
  const login = async (event: FormEvent) => { event.preventDefault(); try { await signInAdmin(email,password); setAuthenticated(true) } catch (err) { setStatus(err instanceof Error ? err.message : 'Login failed') } }
  const logout = async () => { await signOutAdmin(); setAuthenticated(false) }
  const save = async () => { setStatus('Saving…'); try { await saveCms(cms); setStatus('Saved successfully.') } catch (err) { setStatus(err instanceof Error ? err.message : 'Save failed') } }
  if (!authenticated) return <div className="login-page"><div className="login-card"><Logo/><h1>CMS administration</h1><p>{supabaseEnabled ? 'Sign in with an approved administrator account.' : 'Supabase is not configured. Enter demo mode to preview the CMS; changes are stored only in this browser.'}</p>{supabaseEnabled ? <form onSubmit={login}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button className="button primary full">Sign in</button></form> : <button className="button primary full" onClick={() => setAuthenticated(true)}>Enter demo CMS</button>}{status && <p className="form-status">{status}</p>}<a href="/">← Back to public app</a></div></div>
  return <AdminShell onLogout={logout}><div className="admin-header"><div><span className="eyebrow">Vermaak technology administration</span><h1>E-SACCO Content Management</h1><p>Manage products, EventSuite payment links and public content. Financial approvals remain with Zimba SACCO.</p></div><button className="button primary" onClick={save}><Save size={17}/> Save changes</button></div>{status && <div className="form-status">{status}</div>}<div className="admin-tabs"><button className={tab==='products'?'active':''} onClick={()=>setTab('products')}>Products and payments</button><button className={tab==='content'?'active':''} onClick={()=>setTab('content')}>Site content</button><button className={tab==='announcements'?'active':''} onClick={()=>setTab('announcements')}>Announcements</button></div>
    {tab === 'products' && <ProductEditor cms={cms} setCms={setCms}/>} {tab === 'content' && <ContentEditor cms={cms} setCms={setCms}/>} {tab === 'announcements' && <AnnouncementEditor cms={cms} setCms={setCms}/>}<div className="admin-note"><ShieldCheck/><div><b>Payment-link control</b><p>Each product stores an exact EventSuite HTTPS payment link. The web app redirects members to that URL; it does not record payment as completed without an approved callback or administrative reconciliation.</p></div></div></AdminShell>
}

function ProductEditor({ cms, setCms }: { cms: CmsState; setCms: (next: CmsState) => void }) {
  const update = (id: string, field: keyof Product, value: string|number|boolean) => setCms({ ...cms, products: cms.products.map(p => p.id === id ? { ...p, [field]: value } : p) })
  const add = () => setCms({ ...cms, products: [...cms.products, { id: crypto.randomUUID(), name: 'New appliance', category: 'Cookers', price: 0, deposit: 0, installment: 0, capacity: '', powerRating: '', warranty: '', description: '', imageUrl: '', paymentUrl: cms.content.defaultPaymentUrl, featured: false, active: false }] })
  const remove = (id: string) => confirm('Remove this product from the CMS?') && setCms({ ...cms, products: cms.products.filter(p=>p.id!==id) })
  return <section className="editor-section"><div className="editor-title"><div><h2>Products and EventSuite links</h2><p>Use the exact payment URL generated in EventSuite for each appliance.</p></div><button className="button secondary" onClick={add}><Plus size={17}/> Add product</button></div><div className="editor-list">{cms.products.map(product => <details key={product.id} open><summary><span><Pencil size={17}/><b>{product.name}</b></span><Pill tone={product.active?'green':'grey'}>{product.active?'Published':'Draft'}</Pill></summary><div className="form-grid"><label>Name<input value={product.name} onChange={e=>update(product.id,'name',e.target.value)}/></label><label>Category<input value={product.category} onChange={e=>update(product.id,'category',e.target.value)}/></label><label>Price (UGX)<input type="number" value={product.price} onChange={e=>update(product.id,'price',Number(e.target.value))}/></label><label>Deposit (UGX)<input type="number" value={product.deposit} onChange={e=>update(product.id,'deposit',Number(e.target.value))}/></label><label>Monthly instalment<input type="number" value={product.installment} onChange={e=>update(product.id,'installment',Number(e.target.value))}/></label><label>Capacity<input value={product.capacity} onChange={e=>update(product.id,'capacity',e.target.value)}/></label><label>Power rating<input value={product.powerRating} onChange={e=>update(product.id,'powerRating',e.target.value)}/></label><label>Warranty<input value={product.warranty} onChange={e=>update(product.id,'warranty',e.target.value)}/></label><label className="span-2">Image URL<input type="url" value={product.imageUrl} onChange={e=>update(product.id,'imageUrl',e.target.value)}/></label><label className="span-2">EventSuite payment link<input type="url" value={product.paymentUrl} onChange={e=>update(product.id,'paymentUrl',e.target.value)} placeholder="https://events.vermaak.africa/..."/></label><label className="span-2">Description<textarea value={product.description} onChange={e=>update(product.id,'description',e.target.value)}/></label><label className="checkbox"><input type="checkbox" checked={product.active} onChange={e=>update(product.id,'active',e.target.checked)}/> Published</label><label className="checkbox"><input type="checkbox" checked={product.featured} onChange={e=>update(product.id,'featured',e.target.checked)}/> Featured</label></div><button className="danger-link" onClick={()=>remove(product.id)}><Trash2 size={16}/> Remove product</button></details>)}</div></section>
}

function ContentEditor({ cms, setCms }: { cms: CmsState; setCms: (next: CmsState) => void }) {
  const update = (field: keyof CmsState['content'], value: string) => setCms({ ...cms, content: { ...cms.content, [field]: value } })
  return <section className="editor-section"><h2>Public site content</h2><div className="form-grid"><label className="span-2">Hero title<input value={cms.content.heroTitle} onChange={e=>update('heroTitle',e.target.value)}/></label><label className="span-2">Hero subtitle<textarea value={cms.content.heroSubtitle} onChange={e=>update('heroSubtitle',e.target.value)}/></label><label>Support phone<input value={cms.content.supportPhone} onChange={e=>update('supportPhone',e.target.value)}/></label><label>Support email<input type="email" value={cms.content.supportEmail} onChange={e=>update('supportEmail',e.target.value)}/></label><label className="span-2">Default EventSuite payment URL<input type="url" value={cms.content.defaultPaymentUrl} onChange={e=>update('defaultPaymentUrl',e.target.value)}/></label></div></section>
}

function AnnouncementEditor({ cms, setCms }: { cms: CmsState; setCms: (next: CmsState) => void }) {
  const update = (id: string, field: keyof Announcement, value: string|boolean) => setCms({ ...cms, announcements: cms.announcements.map(a=>a.id===id?{...a,[field]:value}:a) })
  const add = () => setCms({ ...cms, announcements: [...cms.announcements, { id: crypto.randomUUID(), title: 'New announcement', body: '', level: 'info', active: false }] })
  return <section className="editor-section"><div className="editor-title"><h2>Announcements</h2><button className="button secondary" onClick={add}><Plus size={17}/> Add announcement</button></div><div className="editor-list">{cms.announcements.map(item=><div className="announcement-editor" key={item.id}><label>Title<input value={item.title} onChange={e=>update(item.id,'title',e.target.value)}/></label><label>Message<textarea value={item.body} onChange={e=>update(item.id,'body',e.target.value)}/></label><label>Style<select value={item.level} onChange={e=>update(item.id,'level',e.target.value)}><option value="info">Information</option><option value="success">Success</option><option value="warning">Warning</option></select></label><label className="checkbox"><input type="checkbox" checked={item.active} onChange={e=>update(item.id,'active',e.target.checked)}/> Published</label></div>)}</div></section>
}

function App() {
  const { state, setState, loading, error } = useCms()
  const content = useMemo(() => state, [state])
  if (loading) return <div className="loading"><Logo/><span>Loading E-SACCO…</span></div>
  if (error) return <div className="loading"><Logo/><b>Unable to load content</b><span>{error}</span></div>
  return <Routes><Route path="/" element={<HomePage cms={content}/>}/><Route path="/save" element={<SavePage/>}/><Route path="/marketplace" element={<MarketplacePage cms={content}/>}/><Route path="/loan" element={<LoanPage/>}/><Route path="/services" element={<ServicesPage cms={content}/>}/><Route path="/admin" element={<AdminPage cms={content} setCms={setState}/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes>
}

export default App
