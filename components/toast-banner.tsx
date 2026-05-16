import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ToastType = 'success' | 'error' | 'warning' | 'info';

type ToastBannerProps = {
  toast: {
    type: ToastType;
    title: string;
    message: string;
  } | null;
  onClose: () => void;
};

export default function ToastBanner({ toast, onClose }: ToastBannerProps) {
  if (!toast) {
    return null;
  }

  return (
    <View style={[styles.toast, toastToneStyles[toast.type]]}>
      <View style={styles.content}>
        <Text style={styles.title}>{toast.title}</Text>
        <Text style={styles.message}>{toast.message}</Text>
      </View>
      <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close notification">
        <Text style={styles.close}>x</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: 14,
  },
  message: {
    color: '#cbd5e1',
    lineHeight: 19,
  },
  close: {
    color: '#cbd5e1',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

const toastToneStyles = StyleSheet.create({
  success: {
    borderColor: 'rgba(16, 185, 129, 0.34)',
  },
  error: {
    borderColor: 'rgba(239, 68, 68, 0.34)',
  },
  warning: {
    borderColor: 'rgba(245, 158, 11, 0.34)',
  },
  info: {
    borderColor: 'rgba(59, 130, 246, 0.34)',
  },
});
