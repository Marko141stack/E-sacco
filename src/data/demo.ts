import type { CmsState, SavingsTransaction } from '../types'

export const demoCms: CmsState = {
  content: {
    heroTitle: 'Own a cleaner way to cook',
    heroSubtitle: 'Save consistently, access responsible credit through Zimba SACCO and purchase approved electric-cooking appliances.',
    supportPhone: '+256 700 000 000',
    supportEmail: 'support@example.org',
    defaultPaymentUrl: import.meta.env.VITE_DEFAULT_EVENTSUITE_URL || 'https://events.vermaak.africa',
  },
  announcements: [
    { id: 'a1', title: 'Save towards clean cooking', body: 'Make a contribution today and move closer to your appliance goal.', level: 'info', active: true },
    { id: 'a2', title: 'Responsible finance', body: 'All final credit decisions and terms are approved by Zimba SACCO.', level: 'success', active: true },
  ],
  products: [
    {
      id: 'epc-6l', name: 'Electric Pressure Cooker', category: 'Cookers', price: 850000, deposit: 170000,
      installment: 75000, capacity: '6 litres', powerRating: '1,000 W', warranty: '12 months',
      description: 'Fast, efficient pressure cooking for households and small food businesses.',
      imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=900&q=80',
      paymentUrl: 'https://events.vermaak.africa', featured: true, active: true,
    },
    {
      id: 'induction-2kw', name: 'Induction Cooker', category: 'Cookers', price: 420000, deposit: 84000,
      installment: 42000, capacity: 'Single plate', powerRating: '2,000 W', warranty: '12 months',
      description: 'Responsive countertop cooking with precise heat control and an easy-clean surface.',
      imageUrl: 'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=900&q=80',
      paymentUrl: 'https://events.vermaak.africa', featured: true, active: true,
    },
    {
      id: 'kettle-17l', name: 'Electric Kettle', category: 'Small appliances', price: 120000, deposit: 24000,
      installment: 24000, capacity: '1.7 litres', powerRating: '1,500 W', warranty: '6 months',
      description: 'A durable electric kettle for fast boiling at home, work or a small business.',
      imageUrl: 'https://images.unsplash.com/photo-1594213114663-d94db9b17125?auto=format&fit=crop&w=900&q=80',
      paymentUrl: 'https://events.vermaak.africa', featured: false, active: true,
    },
  ],
}

export const transactions: SavingsTransaction[] = [
  { id: 't1', description: 'Goal savings deposit', date: '24 Oct 2026', amount: 50000, status: 'Completed' },
  { id: 't2', description: 'Mobile Money deposit', date: '10 Oct 2026', amount: 70000, status: 'Completed' },
  { id: 't3', description: 'Monthly contribution', date: '25 Sep 2026', amount: 50000, status: 'Completed' },
]
