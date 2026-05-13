const categories = [
  { id: 'mechanic', name: 'Mechanic', available: 12 },
  { id: 'electrician', name: 'Electrician', available: 8 },
  { id: 'plumber', name: 'Plumber', available: 6 },
  { id: 'barber', name: 'Barber', available: 20 },
  { id: 'cleaner', name: 'Cleaner', available: 9 },
  { id: 'tailor', name: 'Tailor', available: 5 },
];

const providers = [
  {
    id: 'prov-001',
    name: 'Kwame Plumbing',
    category: 'Plumber',
    city: 'Accra',
    rate: 40,
    rating: 4.8,
    reviews: 124,
    availability: ['Mon 09:00', 'Tue 14:00', 'Thu 10:00'],
  },
  {
    id: 'prov-002',
    name: 'SparkFix Electrical',
    category: 'Electrician',
    city: 'Kumasi',
    rate: 52,
    rating: 4.9,
    reviews: 91,
    availability: ['Wed 11:30', 'Fri 16:00', 'Sat 09:00'],
  },
  {
    id: 'prov-003',
    name: 'Aisha Home Care',
    category: 'Cleaner',
    city: 'Accra',
    rate: 22,
    rating: 4.7,
    reviews: 78,
    availability: ['Daily 08:00', 'Daily 13:00'],
  },
  {
    id: 'prov-004',
    name: 'Emmanuel Auto Works',
    category: 'Mechanic',
    city: 'Tema',
    rate: 45,
    rating: 4.9,
    reviews: 141,
    availability: ['Mon 10:00', 'Thu 15:00', 'Sat 12:00'],
  },
];

const services = providers.map((provider) => ({
  id: `svc-${provider.id}`,
  title: `${provider.category} service`,
  providerId: provider.id,
  providerName: provider.name,
  category: provider.category,
  city: provider.city,
  rate: provider.rate,
  rating: provider.rating,
}));

const bookings = [
  {
    id: 'book-001',
    serviceId: 'svc-prov-002',
    providerId: 'prov-002',
    seekerName: 'Kojo Mensah',
    date: '2026-05-15',
    time: '09:00',
    status: 'confirmed',
  },
  {
    id: 'book-002',
    serviceId: 'svc-prov-001',
    providerId: 'prov-001',
    seekerName: 'Efua Anane',
    date: '2026-05-16',
    time: '14:30',
    status: 'pending',
  },
];

const appUsers = [
  {
    id: 'user-001',
    name: 'Demo Provider',
    email: 'provider@sorted.app',
    passwordHash: '$2b$10$Rlc3nVqIgDfae9nW1VDmQ.7j7xYm1a53SE5nkm4f4g3kQyHgafzTu',
    seedPassword: 'sorted123',
    role: 'provider',
  },
  {
    id: 'user-002',
    name: 'Demo Seeker',
    email: 'seeker@sorted.app',
    passwordHash: '$2b$10$Rlc3nVqIgDfae9nW1VDmQ.7j7xYm1a53SE5nkm4f4g3kQyHgafzTu',
    seedPassword: 'sorted123',
    role: 'seeker',
  },
];

module.exports = {
  categories,
  providers,
  services,
  bookings,
  appUsers,
};
