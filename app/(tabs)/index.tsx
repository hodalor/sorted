import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const categories = [
  { name: 'Mechanic', available: 12, color: '#fbbf24' },
  { name: 'Electrician', available: 8, color: '#f59e0b' },
  { name: 'Plumber', available: 6, color: '#93c5fd' },
  { name: 'Barber', available: 20, color: '#84cc16' },
  { name: 'Cleaner', available: 9, color: '#67e8f9' },
  { name: 'Tailor', available: 5, color: '#a3e635' },
];

const providers = [
  { name: 'Emmanuel Auto Works', role: 'Mechanic', rate: '$45/hr', rating: '4.9' },
  { name: 'Aisha Home Care', role: 'Cleaner', rate: '$22/hr', rating: '4.8' },
];

export default function HomeScreen() {
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
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEyebrow}>Services</Text>
        <Text style={styles.sectionTitle}>Browse categories</Text>
      </View>

      <View style={styles.grid}>
        {categories.map((item) => (
          <View key={item.name} style={styles.categoryCard}>
            <View style={[styles.categoryIcon, { borderColor: item.color }]}>
              <Text style={[styles.categoryIconText, { color: item.color }]}>{item.name[0]}</Text>
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
        {providers.map((provider) => (
          <View key={provider.name} style={styles.providerCard}>
            <View style={styles.providerHead}>
              <View>
                <Text style={styles.cardTitle}>{provider.name}</Text>
                <Text style={styles.cardMeta}>{provider.role}</Text>
              </View>
              <View style={styles.ratingPill}>
                <Text style={styles.ratingText}>{provider.rating}</Text>
              </View>
            </View>
            <Text style={styles.cardMeta}>Available today • {provider.rate}</Text>
          </View>
        ))}
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
});
