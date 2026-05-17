import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type ProfileActionButtonProps = {
  isPrimary?: boolean;
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function ProfileActionButton({
  isPrimary = false,
  label,
  onPress,
  disabled = false,
}: ProfileActionButtonProps) {
  const theme = useAppTheme();
  const palette = Colors[theme];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: isPrimary ? palette.tint : palette.card,
          borderColor: isPrimary ? palette.tint : palette.border,
          opacity: disabled ? 0.6 : 1,
        },
      ]}>
      <ThemedText
        type="defaultSemiBold"
        style={{ color: isPrimary ? palette.background : palette.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
