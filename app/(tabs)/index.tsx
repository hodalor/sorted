import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import LoadingDots from '@/components/loading-dots';
import ToastBanner from '@/components/toast-banner';
import { useAuth } from '@/context/auth-context';
import { apiGet, apiPost } from '@/lib/api';

const colors = ['#fbbf24', '#f59e0b', '#93c5fd', '#84cc16', '#67e8f9', '#a3e635'];

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<{ name: string; available: number }[]>([]);
  const [providers, setProviders] = useState<
    {
      id?: string;
      _id?: string;
      serviceId?: string;
      name: string;
      category: string;
      rate: number;
      rating: number;
      bio: string;
    }[]
  >([]);
  const [message, setMessage] = useState('Loading services...');
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [bookingProviderId, setBookingProviderId] = useState('');

  const showToast = (
    type: 'success' | 'error' | 'warning' | 'info',
    nextMessage: string,
    title?: string
  ) => {
    setMessage(nextMessage);
    setToast({
      type,
      title:
        title ||
        {
          success: 'Success',
          error: 'Error',
          warning: 'Warning',
          info: 'Notice',
        }[type],
      message: nextMessage,
    });
  };

  const filteredProviders = useMemo(() => {
    if (!search.trim()) {
      return providers;
    }

    const query = search.toLowerCase();
    return providers.filter(
      (provider) =>
        provider.name.toLowerCase().includes(query) || provider.category.toLowerCase().includes(query)
    );
  }, [providers, search]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setToast(null);
    }, 4200);

    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!session?.user) {
      setMessage('Login first to book services.');
      return;
    }

    const loadData = async () => {
      try {
        setPortalLoading(true);
        const [categoryData, providerData] = await Promise.all([
          apiGet('/services/categories'),
          apiGet('/services/providers?status=approved'),
        ]);

        setCategories(categoryData.items);
        setProviders(providerData.items);
        setMessage('Synced with shared backend.');
      } catch (error) {
        showToast('error', error instanceof Error ? error.message : 'Could not load services.');
      } finally {
        setPortalLoading(false);
      }
    };

    loadData();
  }, [session]);

  const handleBooking = async (provider: { id?: string; _id?: string; name: string }) => {
    try {
      if (!session?.user) {
        router.replace('/');
        return;
      }

      const providerId = provider.id || provider._id;
      setBookingProviderId(String(providerId || ''));

      await apiPost('/bookings', {
        serviceId: (provider as { serviceId?: string }).serviceId,
        providerId,
        seekerName: session.user.name,
        seekerPhone: session.user.phoneNumber,
        seekerEmail: session.user.email,
        date: '2026-05-20',
        time: '10:00',
      });

      showToast('success', `Booked ${provider.name} successfully.`);
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Could not create booking.');
    } finally {
      setBookingProviderId('');
    }
  };

  if (!session?.user) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.title}>Login required</Text>
        <Text style={styles.cardMeta}>Return to the first screen to login or create your account.</Text>
        <TouchableOpacity style={styles.bookButton} onPress={() => router.replace('/')}>
          <Text style={styles.bookButtonText}>Go to login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ToastBanner toast={toast} onClose={() => setToast(null)} />
      <View style={styles.hero}>
        <View>
          <Text style={styles.location}>Accra, Ghana</Text>
          <Text style={styles.title}>What do you need?</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{session.user.name.slice(0, 2).toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.searchLabel}>Search a service...</Text>
        <TextInput
          placeholder="Mechanic, cleaner, barber..."
          placeholderTextColor="#64748b"
          style={styles.input}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEyebrow}>Services</Text>
        <Text style={styles.sectionTitle}>Browse categories</Text>
      </View>

      {portalLoading ? (
        <View style={styles.loadingCard}>
          <LoadingDots />
          <Text style={styles.cardMeta}>Loading live data</Text>
        </View>
      ) : categories.length ? (
        <View style={styles.grid}>
          {categories.map((item, index) => (
            <View key={item.name} style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { borderColor: colors[index % colors.length] }]}>
                <Text style={[styles.categoryIconText, { color: colors[index % colors.length] }]}>
                  {item.name[0]}
                </Text>
              </View>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>{item.available} available</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.loadingCard}>
          <Text style={styles.cardMeta}>No categories yet. Create them in admin first.</Text>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEyebrow}>Featured</Text>
        <Text style={styles.sectionTitle}>Top providers</Text>
      </View>

      {filteredProviders.length ? (
        <View style={styles.list}>
          {filteredProviders.map((provider) => {
            const providerId = provider.id || provider._id;
            const isBooking = bookingProviderId === String(providerId || '');

            return (
              <View key={provider.name} style={styles.providerCard}>
                <View style={styles.providerHead}>
                  <View>
                    <Text style={styles.cardTitle}>{provider.name}</Text>
                    <Text style={styles.cardMeta}>{provider.category}</Text>
                  </View>
                  <View style={styles.ratingPill}>
                    <Text style={styles.ratingText}>{provider.rating || '0.0'}</Text>
                  </View>
                </View>
                <Text style={styles.cardMeta}>{provider.bio || 'No provider description yet.'}</Text>
                <View style={styles.providerFooter}>
                  <Text style={styles.cardMeta}>Available today • ${provider.rate}/hr</Text>
                  <TouchableOpacity
                    style={[styles.bookButton, isBooking ? styles.disabledButton : null]}
                    onPress={() => handleBooking(provider)}
                    disabled={isBooking || !provider.serviceId}>
                    {isBooking ? (
                      <View style={styles.buttonContent}>
                        <LoadingDots />
                        <Text style={styles.bookButtonText}>Booking</Text>
                      </View>
                    ) : (
                      <Text style={styles.bookButtonText}>Book</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.loadingCard}>
          <Text style={styles.cardMeta}>No approved providers yet.</Text>
        </View>
      )}

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 20,
    justifyContent: 'center',
    gap: 16,
  },
  screen: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    padding: 20,
    paddingBottom: 96,
    gap: 20,
  },
  hero: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  location: {
    color: '#94a3b8',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  title: {
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: '700',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#93c5fd',
    fontWeight: '700',
  },
  searchCard: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
  },
  searchLabel: {
    color: '#cbd5e1',
    marginBottom: 10,
  },
  input: {
    color: '#f8fafc',
    fontSize: 16,
    paddingVertical: 4,
  },
  loadingCard: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    alignItems: 'center',
    gap: 10,
  },
  sectionHeader: {
    marginTop: 8,
  },
  sectionEyebrow: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    borderRadius: 22,
    padding: 18,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    gap: 10,
  },
  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconText: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  cardMeta: {
    color: '#cbd5e1',
    lineHeight: 20,
  },
  list: {
    gap: 12,
  },
  providerCard: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    gap: 10,
  },
  providerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  providerHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingPill: {
    minWidth: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingText: {
    color: '#fde68a',
    fontWeight: '700',
  },
  bookButton: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1d4ed8',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  bookButtonText: {
    color: '#eff6ff',
    fontWeight: '700',
  },
  message: {
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 20,
  },
});
