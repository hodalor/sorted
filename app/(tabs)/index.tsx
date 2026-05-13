import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { apiGet, apiPost } from '@/lib/api';

const colors = ['#fbbf24', '#f59e0b', '#93c5fd', '#84cc16', '#67e8f9', '#a3e635'];

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<{ name: string; available: number }[]>([]);
  const [providers, setProviders] = useState<
    { id?: string; _id?: string; name: string; category: string; rate: number; rating: number; bio: string }[]
  >([]);
  const [message, setMessage] = useState('Loading services...');

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
    const loadData = async () => {
      try {
        const [categoryData, providerData] = await Promise.all([
          apiGet('/services/categories'),
          apiGet('/services/providers?status=approved'),
        ]);

        setCategories(categoryData.items);
        setProviders(providerData.items);
        setMessage('Synced with shared backend.');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Could not load services.');
      }
    };

    loadData();
  }, []);

  const handleBooking = async (provider: { id?: string; _id?: string; name: string }) => {
    try {
      const providerId = provider.id || provider._id;

      await apiPost('/bookings', {
        serviceId: `svc-${providerId}`,
        providerId,
        seekerName: 'Kojo Osei',
        seekerEmail: 'seeker@sorted.app',
        date: '2026-05-20',
        time: '10:00',
      });

      setMessage(`Booked ${provider.name} successfully.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not create booking.');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View>
          <Text style={styles.location}>Accra, Ghana</Text>
          <Text style={styles.title}>What do you need?</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>KO</Text>
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

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEyebrow}>Featured</Text>
        <Text style={styles.sectionTitle}>Top providers</Text>
      </View>

      <View style={styles.list}>
        {filteredProviders.map((provider) => (
          <View key={provider.name} style={styles.providerCard}>
            <View style={styles.providerHead}>
              <View>
                <Text style={styles.cardTitle}>{provider.name}</Text>
                <Text style={styles.cardMeta}>{provider.category}</Text>
              </View>
              <View style={styles.ratingPill}>
                <Text style={styles.ratingText}>{provider.rating}</Text>
              </View>
            </View>
            <Text style={styles.cardMeta}>{provider.bio}</Text>
            <View style={styles.providerFooter}>
              <Text style={styles.cardMeta}>Available today • ${provider.rate}/hr</Text>
              <TouchableOpacity style={styles.bookButton} onPress={() => handleBooking(provider)}>
                <Text style={styles.bookButtonText}>Book</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.message}>{message}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
