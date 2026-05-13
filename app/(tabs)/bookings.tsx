import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/auth-context';
import { apiGet } from '@/lib/api';

export default function BookingsScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [jobs, setJobs] = useState<
    {
      id?: string;
      _id?: string;
      serviceTitle: string;
      providerName: string;
      date: string;
      time: string;
      status: string;
    }[]
  >([]);
  const [message, setMessage] = useState('Loading bookings...');

  useEffect(() => {
    if (!session?.user) {
      setMessage('Login first to view your bookings.');
      router.replace('/');
      return;
    }

    const loadBookings = async () => {
      try {
        const bookingData = await apiGet(`/bookings?seekerPhone=${encodeURIComponent(session.user.phoneNumber)}`);
        setJobs(bookingData.items);
        setMessage('Your bookings are synced.');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Could not load bookings.');
      }
    };

    loadBookings();
  }, [session]);

  if (!session?.user) {
    return null;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Bookings</Text>
      <Text style={styles.title}>Track upcoming jobs</Text>
      <Text style={styles.subtitle}>
        Review appointment times, provider details, and booking status in one place.
      </Text>

      <View style={styles.list}>
        {jobs.map((job) => (
          <View key={job.id || job._id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>{job.serviceTitle}</Text>
              <Text style={styles.status}>{job.status}</Text>
            </View>
            <Text style={styles.meta}>{job.providerName}</Text>
            <Text style={styles.meta}>
              {job.date} • {job.time}
            </Text>
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
    gap: 12,
  },
  eyebrow: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#cbd5e1',
    lineHeight: 22,
    marginBottom: 8,
  },
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  status: {
    color: '#fbbf24',
    fontWeight: '700',
  },
  meta: {
    color: '#cbd5e1',
    lineHeight: 20,
  },
  message: {
    color: '#cbd5e1',
    textAlign: 'center',
  },
});
