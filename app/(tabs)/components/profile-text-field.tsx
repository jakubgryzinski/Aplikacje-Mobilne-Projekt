import { StyleSheet, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export type ProfileTextFieldProps = {
  accessibilityLabel?: string;
  editable?: boolean;
  errorMessage?: string;
  keyboardType?: KeyboardTypeOptions;
  label: string;
  onBlur?: () => void;
  onChangeText: (value: string) => void;
  placeholder?: string;
  value: string;
};

export function ProfileTextField({
  accessibilityLabel,
  editable = true,
  errorMessage,
  keyboardType,
  label,
  onBlur,
  onChangeText,
  placeholder,
  value,
}: ProfileTextFieldProps) {
  const theme = useAppTheme();
  const palette = Colors[theme];

  return (
    <View style={styles.field}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <TextInput
        accessibilityLabel={accessibilityLabel ?? label}
        editable={editable}
        keyboardType={keyboardType}
        onBlur={onBlur}
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
            opacity: editable ? 1 : 0.7,
          },
        ]}
        value={value}
      />
      {errorMessage ? (
        <ThemedText style={{ color: palette.errorText }}>{errorMessage}</ThemedText>
      ) : null}
    </View>
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
