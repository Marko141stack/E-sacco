import { demoCms } from '../data/demo'
import type { Announcement, CmsState, Product, SiteContent } from '../types'
import { supabase, supabaseEnabled } from './supabase'

const STORAGE_KEY = 'esacco-demo-cms-v1'

const fromDbProduct = (row: Record<string, unknown>): Product => ({
  id: String(row.id), name: String(row.name), category: String(row.category), price: Number(row.price),
  deposit: Number(row.deposit), installment: Number(row.installment), capacity: String(row.capacity || ''),
  powerRating: String(row.power_rating || ''), warranty: String(row.warranty || ''),
  description: String(row.description || ''), imageUrl: String(row.image_url || ''), paymentUrl: String(row.payment_url || ''),
  featured: Boolean(row.featured), active: Boolean(row.active),
})

export async function loadCms(): Promise<CmsState> {
  if (!supabaseEnabled || !supabase) {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : demoCms
  }
  const [products, announcements, settings] = await Promise.all([
    supabase.from('products').select('*').order('created_at'),
    supabase.from('announcements').select('*').order('created_at'),
    supabase.from('site_settings').select('*').eq('id', 'main').maybeSingle(),
  ])
  if (products.error || announcements.error || settings.error) throw products.error || announcements.error || settings.error
  const content = (settings.data?.content || demoCms.content) as SiteContent
  return {
    products: (products.data || []).map(row => fromDbProduct(row as Record<string, unknown>)),
    announcements: (announcements.data || []).map(row => ({
      id: row.id, title: row.title, body: row.body, level: row.level, active: row.active,
    } as Announcement)),
    content,
  }
}

export async function saveCms(state: CmsState): Promise<void> {
  if (!supabaseEnabled || !supabase) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return
  }
  const productRows = state.products.map(product => ({
    id: product.id, name: product.name, category: product.category, price: product.price,
    deposit: product.deposit, installment: product.installment, capacity: product.capacity,
    power_rating: product.powerRating, warranty: product.warranty, description: product.description,
    image_url: product.imageUrl, payment_url: product.paymentUrl, featured: product.featured, active: product.active,
  }))
  const announcementRows = state.announcements.map(item => ({ ...item }))
  const results = await Promise.all([
    supabase.from('products').upsert(productRows),
    supabase.from('announcements').upsert(announcementRows),
    supabase.from('site_settings').upsert({ id: 'main', content: state.content }),
  ])
  const error = results.find(result => result.error)?.error
  if (error) throw error

  const [storedProducts, storedAnnouncements] = await Promise.all([
    supabase.from('products').select('id'),
    supabase.from('announcements').select('id'),
  ])
  if (storedProducts.error || storedAnnouncements.error) throw storedProducts.error || storedAnnouncements.error
  const productIds = new Set(state.products.map(item => item.id))
  const announcementIds = new Set(state.announcements.map(item => item.id))
  const removedProductIds = (storedProducts.data || []).map(item => item.id).filter(id => !productIds.has(id))
  const removedAnnouncementIds = (storedAnnouncements.data || []).map(item => item.id).filter(id => !announcementIds.has(id))
  const deletions = await Promise.all([
    removedProductIds.length ? supabase.from('products').delete().in('id', removedProductIds) : Promise.resolve({ error: null }),
    removedAnnouncementIds.length ? supabase.from('announcements').delete().in('id', removedAnnouncementIds) : Promise.resolve({ error: null }),
  ])
  const deleteError = deletions.find(result => result.error)?.error
  if (deleteError) throw deleteError
}

export async function signInAdmin(email: string, password: string) {
  if (!supabaseEnabled || !supabase) return { demo: true }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOutAdmin() {
  if (supabase) await supabase.auth.signOut()
}
