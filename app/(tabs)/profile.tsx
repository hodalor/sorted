import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/context/auth-context';
import { apiGet, apiPatch, apiPost } from '@/lib/api';

const onboardingDefaults = {
  businessName: '',
  isRegisteredBusiness: 'no',
  registrationNumber: '',
  category: 'Mechanic',
  serviceTitle: '',
  city: 'Accra',
  rate: '',
  bio: '',
  profilePictureUrl: '',
  workPhotoOne: '',
  workPhotoTwo: '',
  workPhotoThree: '',
  availability: 'Mon 09:00, Tue 14:00, Thu 10:00',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { session, setSession } = useAuth();
  const [stats, setStats] = useState([
    { label: 'Bookings completed', value: '0' },
    { label: 'Visible providers', value: '0' },
    { label: 'Reviews posted', value: '0' },
  ]);
  const [message, setMessage] = useState('Manage your booking and provider account.');
  const [providerAccount, setProviderAccount] = useState<{
    provider?: {
      id?: string;
      _id?: string;
      businessName: string;
      status: string;
      bio: string;
      rate: number;
      availability: string[];
      serviceTitle: string;
    };
    bookings?: {
      id?: string;
      _id?: string;
      serviceTitle: string;
      seekerName: string;
      date: string;
      time: string;
      status: string;
    }[];
  } | null>(null);
  const [providerForm, setProviderForm] = useState(onboardingDefaults);
  const [providerEditor, setProviderEditor] = useState({
    serviceTitle: '',
    rate: '',
    availability: '',
    bio: '',
  });

  useEffect(() => {
    if (!session?.user) {
      router.replace('/');
      return;
    }

    const loadProfileData = async () => {
      try {
        const requests = [
          apiGet(`/bookings?seekerPhone=${encodeURIComponent(session.user.phoneNumber)}`),
          apiGet('/reviews'),
          apiGet('/services/providers?status=approved'),
        ];

        if (session.user.providerProfile) {
          requests.push(apiGet(`/providers/account/${session.user.id}`));
        }

        const [bookingData, reviewData, providerData, providerAccountData] = await Promise.all(requests);

        setStats([
          { label: 'Bookings completed', value: String(bookingData.total) },
          { label: 'Visible providers', value: String(providerData.total) },
          { label: 'Reviews posted', value: String(reviewData.total) },
        ]);

        if (providerAccountData) {
          setProviderAccount(providerAccountData);
          setProviderEditor({
            serviceTitle: providerAccountData.provider.serviceTitle || '',
            rate: String(providerAccountData.provider.rate || ''),
            availability: (providerAccountData.provider.availability || []).join(', '),
            bio: providerAccountData.provider.bio || '',
          });
        } else {
          setProviderAccount(null);
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Could not load profile data.');
      }
    };

    loadProfileData();
  }, [router, session]);

  if (!session?.user) {
    return null;
  }

  const handleOnboarding = async () => {
    try {
      const response = await apiPost('/providers', {
        userId: session.user.id,
        name: session.user.name,
        businessName: providerForm.businessName,
        isRegisteredBusiness: providerForm.isRegisteredBusiness === 'yes',
        registrationNumber: providerForm.registrationNumber,
        category: providerForm.category,
        city: providerForm.city,
        rate: Number(providerForm.rate),
        bio: providerForm.bio,
        profilePictureUrl: providerForm.profilePictureUrl,
        workPhotos: [
          providerForm.workPhotoOne,
          providerForm.workPhotoTwo,
          providerForm.workPhotoThree,
        ].filter(Boolean),
        availability: providerForm.availability
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        serviceTitle: providerForm.serviceTitle,
      });

      setSession({
        ...session,
        user: {
          ...session.user,
          providerProfile: {
            id: response.provider.id || response.provider._id,
            businessName: response.provider.businessName,
            status: response.provider.status,
            category: response.provider.category,
            serviceTitle: response.provider.serviceTitle,
          },
          permissions: {
            ...session.user.permissions,
            hasProviderProfile: true,
            canProvide: false,
          },
        },
      });
      setProviderForm(onboardingDefaults);
      setMessage('Provider profile submitted. Wait for KYC approval.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not submit provider profile.');
    }
  };

  const handleProviderSettings = async () => {
    try {
      const providerId = providerAccount?.provider?.id || providerAccount?.provider?._id;

      if (!providerId) {
        return;
      }

      const response = await apiPatch(`/providers/${providerId}/settings`, {
        serviceTitle: providerEditor.serviceTitle,
        rate: Number(providerEditor.rate),
        availability: providerEditor.availability
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        bio: providerEditor.bio,
      });

      setProviderAccount((current) =>
        current
          ? {
              ...current,
              provider: response.provider,
            }
          : current
      );
      setMessage(response.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update provider settings.');
    }
  };

  const handleProviderBookingAction = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    try {
      const response = await apiPatch(`/bookings/${bookingId}/status`, { status });
      setProviderAccount((current) =>
        current
          ? {
              ...current,
              bookings: current.bookings?.map((item) =>
                (item.id || item._id) === bookingId ? response.booking : item
              ),
            }
          : current
      );
      setMessage(`Booking ${status} successfully.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update booking.');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{session.user.name.slice(0, 2).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{session.user.name}</Text>
        <Text style={styles.email}>{session.user.phoneNumber}</Text>
        <Text style={styles.role}>{session.user.address}</Text>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((item) => (
          <View key={item.label} style={styles.statCard}>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {!session.user.providerProfile ? (
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Become service provider</Text>
          <TextInput
            value={providerForm.businessName}
            onChangeText={(businessName) => setProviderForm((current) => ({ ...current, businessName }))}
            style={styles.input}
            placeholder="Business name"
            placeholderTextColor="#64748b"
          />
          <TextInput
            value={providerForm.isRegisteredBusiness}
            onChangeText={(isRegisteredBusiness) =>
              setProviderForm((current) => ({ ...current, isRegisteredBusiness }))
            }
            style={styles.input}
            placeholder="Registered yes or no"
            placeholderTextColor="#64748b"
          />
          {providerForm.isRegisteredBusiness === 'yes' ? (
            <TextInput
              value={providerForm.registrationNumber}
              onChangeText={(registrationNumber) =>
                setProviderForm((current) => ({ ...current, registrationNumber }))
              }
              style={styles.input}
              placeholder="Registration number"
              placeholderTextColor="#64748b"
            />
          ) : null}
          <TextInput
            value={providerForm.category}
            onChangeText={(category) => setProviderForm((current) => ({ ...current, category }))}
            style={styles.input}
            placeholder="Category"
            placeholderTextColor="#64748b"
          />
          <TextInput
            value={providerForm.serviceTitle}
            onChangeText={(serviceTitle) => setProviderForm((current) => ({ ...current, serviceTitle }))}
            style={styles.input}
            placeholder="Service title"
            placeholderTextColor="#64748b"
          />
          <TextInput
            value={providerForm.city}
            onChangeText={(city) => setProviderForm((current) => ({ ...current, city }))}
            style={styles.input}
            placeholder="City"
            placeholderTextColor="#64748b"
          />
          <TextInput
            value={providerForm.rate}
            onChangeText={(rate) => setProviderForm((current) => ({ ...current, rate }))}
            style={styles.input}
            placeholder="Rate"
            placeholderTextColor="#64748b"
            keyboardType="numeric"
          />
          <TextInput
            value={providerForm.bio}
            onChangeText={(bio) => setProviderForm((current) => ({ ...current, bio }))}
            style={[styles.input, styles.textArea]}
            placeholder="Short description"
            placeholderTextColor="#64748b"
            multiline
          />
          <TextInput
            value={providerForm.profilePictureUrl}
            onChangeText={(profilePictureUrl) =>
              setProviderForm((current) => ({ ...current, profilePictureUrl }))
            }
            style={styles.input}
            placeholder="Profile photo URL"
            placeholderTextColor="#64748b"
          />
          <TextInput
            value={providerForm.workPhotoOne}
            onChangeText={(workPhotoOne) => setProviderForm((current) => ({ ...current, workPhotoOne }))}
            style={styles.input}
            placeholder="Work photo 1 URL"
            placeholderTextColor="#64748b"
          />
          <TextInput
            value={providerForm.workPhotoTwo}
            onChangeText={(workPhotoTwo) => setProviderForm((current) => ({ ...current, workPhotoTwo }))}
            style={styles.input}
            placeholder="Work photo 2 URL"
            placeholderTextColor="#64748b"
          />
          <TextInput
            value={providerForm.workPhotoThree}
            onChangeText={(workPhotoThree) => setProviderForm((current) => ({ ...current, workPhotoThree }))}
            style={styles.input}
            placeholder="Work photo 3 URL"
            placeholderTextColor="#64748b"
          />
          <TextInput
            value={providerForm.availability}
            onChangeText={(availability) => setProviderForm((current) => ({ ...current, availability }))}
            style={styles.input}
            placeholder="Availability"
            placeholderTextColor="#64748b"
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleOnboarding}>
            <Text style={styles.primaryButtonText}>Provide service</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {session.user.providerProfile?.status === 'pending' ? (
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>KYC pending</Text>
          <Text style={styles.setting}>
            Your provider profile is under review. You can still book services, but only approved providers
            can accept jobs.
          </Text>
        </View>
      ) : null}

      {providerAccount?.provider?.status === 'approved' ? (
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Provider interface</Text>
          <TextInput
            value={providerEditor.serviceTitle}
            onChangeText={(serviceTitle) => setProviderEditor((current) => ({ ...current, serviceTitle }))}
            style={styles.input}
            placeholder="Service title"
            placeholderTextColor="#64748b"
          />
          <TextInput
            value={providerEditor.rate}
            onChangeText={(rate) => setProviderEditor((current) => ({ ...current, rate }))}
            style={styles.input}
            placeholder="Rate"
            placeholderTextColor="#64748b"
            keyboardType="numeric"
          />
          <TextInput
            value={providerEditor.availability}
            onChangeText={(availability) => setProviderEditor((current) => ({ ...current, availability }))}
            style={styles.input}
            placeholder="Availability"
            placeholderTextColor="#64748b"
          />
          <TextInput
            value={providerEditor.bio}
            onChangeText={(bio) => setProviderEditor((current) => ({ ...current, bio }))}
            style={[styles.input, styles.textArea]}
            placeholder="Provider description"
            placeholderTextColor="#64748b"
            multiline
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleProviderSettings}>
            <Text style={styles.primaryButtonText}>Save settings</Text>
          </TouchableOpacity>

          {providerAccount.bookings?.map((booking) => {
            const bookingId = booking.id || booking._id;
            return (
              <View key={bookingId} style={styles.bookingCard}>
                <Text style={styles.sectionTitle}>{booking.serviceTitle}</Text>
                <Text style={styles.setting}>
                  {booking.seekerName} • {booking.date} • {booking.time}
                </Text>
                <Text style={styles.setting}>Status: {booking.status}</Text>
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.secondaryAction}
                    onPress={() => handleProviderBookingAction(String(bookingId), 'confirmed')}>
                    <Text style={styles.secondaryActionText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryAction}
                    onPress={() => handleProviderBookingAction(String(bookingId), 'cancelled')}>
                    <Text style={styles.secondaryActionText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      <View style={styles.settingsCard}>
        <Text style={styles.sectionTitle}>Account settings</Text>
        <Text style={styles.setting}>Phone: {session.user.phoneNumber}</Text>
        <Text style={styles.setting}>Email: {session.user.email || 'Not provided'}</Text>
        <Text style={styles.setting}>Address: {session.user.address}</Text>
        <TouchableOpacity
          style={styles.secondaryAction}
          onPress={() => {
            setSession(null);
            router.replace('/');
          }}>
          <Text style={styles.secondaryActionText}>Log out</Text>
        </TouchableOpacity>
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
  input: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#f8fafc',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
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
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#f59e0b',
  },
  primaryButtonText: {
    color: '#111827',
    fontWeight: '700',
  },
  bookingCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    gap: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  secondaryAction: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.24)',
  },
  secondaryActionText: {
    color: '#93c5fd',
    fontWeight: '700',
  },
  message: {
    color: '#cbd5e1',
    lineHeight: 20,
    textAlign: 'center',
  },
});
