import { StyleSheet, Text } from 'react-native';

export function Chip({ label, color, dimmed }: { label: string; color: string; dimmed?: boolean }) {
  return (
    <Text style={[styles.chip, { backgroundColor: color }, dimmed && styles.dimmed]} numberOfLines={1}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  chip: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 11,
    borderRadius: 4,
    paddingVertical: 4.5,
    paddingHorizontal: 2,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.2,
    overflow: 'hidden',
    textShadowColor: 'rgba(0,0,0,0.22)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
  },
  dimmed: { opacity: 0.45 },
});
