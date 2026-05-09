import { StyleSheet, type ViewProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type ProfileSettingSectionProps = ViewProps & {
  title: string;
};

export function ProfileSettingSection({
  children,
  style,
  title,
  ...otherProps
}: ProfileSettingSectionProps) {
  return (
    <ThemedView style={[styles.section, style]} {...otherProps}>
      <ThemedText type="subtitle">{title}</ThemedText>
      <ThemedView style={styles.content}>{children}</ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  content: {
    gap: 12,
  },
});
