import { StyleSheet, TextInput, type KeyboardTypeOptions } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export type ProfileTextFieldProps = {
  accessibilityLabel?: string;
  keyboardType?: KeyboardTypeOptions;
  label: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  value: string;
};

export function ProfileTextField({
  accessibilityLabel,
  keyboardType,
  label,
  onChangeText,
  placeholder,
  value,
}: ProfileTextFieldProps) {
  const theme = useAppTheme();
  const palette = Colors[theme];

  return (
    <ThemedView style={styles.field}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <TextInput
        accessibilityLabel={accessibilityLabel ?? label}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.mutedText}
        selectionColor={palette.tint}
        style={[
          styles.input,
          {
            backgroundColor: palette.card,
            borderColor: palette.border,
            color: palette.text,
          },
        ]}
        value={value}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
});
