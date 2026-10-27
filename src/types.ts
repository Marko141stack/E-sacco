export type Product = {
  id: string
  name: string
  category: string
  price: number
  deposit: number
  installment: number
  capacity: string
  powerRating: string
  warranty: string
  description: string
  imageUrl: string
  paymentUrl: string
  featured: boolean
  active: boolean
}

export type Announcement = {
  id: string
  title: string
  body: string
  level: 'info' | 'success' | 'warning'
  active: boolean
}

export type SiteContent = {
  heroTitle: string
  heroSubtitle: string
  supportPhone: string
  supportEmail: string
  defaultPaymentUrl: string
}

export type CmsState = {
  products: Product[]
  announcements: Announcement[]
  content: SiteContent
}

export type SavingsTransaction = {
  id: string
  description: string
  date: string
  amount: number
  status: 'Completed' | 'Pending'
}
