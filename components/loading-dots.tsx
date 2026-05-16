import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useEffect, useRef } from 'react';

const dotColors = ['#ef4444', '#f59e0b', '#22c55e'];

export default function LoadingDots() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 960,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => {
      animation.stop();
      progress.setValue(0);
    };
  }, [progress]);

  return (
    <View style={styles.row}>
      {dotColors.map((color, index) => {
        const start = index * 0.18;
        const peak = start + 0.18;
        const end = start + 0.36;
        const opacity = progress.interpolate({
          inputRange: [0, start, peak, end, 1],
          outputRange: [0.45, 0.45, 1, 0.45, 0.45],
          extrapolate: 'clamp',
        });
        const scale = progress.interpolate({
          inputRange: [0, start, peak, end, 1],
          outputRange: [0.75, 0.75, 1, 0.75, 0.75],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={color}
            style={[
              styles.dot,
              {
                backgroundColor: color,
                opacity,
                transform: [{ scale }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
});
