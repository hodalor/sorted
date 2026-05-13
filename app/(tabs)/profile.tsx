import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { apiGet } from '@/lib/api';

export default function ProfileScreen() {
  const [stats, setStats] = useState([
    { label: 'Bookings completed', value: '0' },
    { label: 'Saved providers', value: '0' },
    { label: 'Reviews posted', value: '0' },
  ]);

  useEffect(() => {
    const loadProfileStats = async () => {
      try {
        const [bookingData, reviewData, providerData] = await Promise.all([
          apiGet('/bookings?seekerEmail=seeker@sorted.app'),
          apiGet('/reviews'),
          apiGet('/services/providers?status=approved'),
        ]);

        setStats([
          { label: 'Bookings completed', value: String(bookingData.total) },
          { label: 'Saved providers', value: String(providerData.total) },
          { label: 'Reviews posted', value: String(reviewData.total) },
        ]);
      } catch {
        setStats((current) => current);
      }
    };

    loadProfileStats();
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>KO</Text>
        </View>
        <Text style={styles.name}>Kojo Osei</Text>
        <Text style={styles.email}>kojo@sorted.app</Text>
        <Text style={styles.role}>Service seeker account</Text>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((item) => (
          <View key={item.label} style={styles.statCard}>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.settingsCard}>
        <Text style={styles.sectionTitle}>Account settings</Text>
        <Text style={styles.setting}>Edit profile information</Text>
        <Text style={styles.setting}>Manage saved addresses</Text>
        <Text style={styles.setting}>Switch between seeker and provider</Text>
        <Text style={styles.setting}>Log out</Text>
      </View>
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
    gap: 16,
  },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarText: {
    color: '#93c5fd',
    fontWeight: '700',
    fontSize: 20,
  },
  name: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '700',
  },
  email: {
    color: '#cbd5e1',
  },
  role: {
    color: '#94a3b8',
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    gap: 4,
  },
  statValue: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: '#cbd5e1',
  },
  settingsCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    gap: 14,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  setting: {
    color: '#cbd5e1',
    lineHeight: 21,
  },
});
