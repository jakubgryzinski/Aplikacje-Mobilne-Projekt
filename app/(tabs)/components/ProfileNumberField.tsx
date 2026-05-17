import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export type ProfileNumberFieldProps = {
  accessibilityLabel?: string;
  editable?: boolean;
  errorMessage?: string;
  label: string;
  onBlur?: () => void;
  onChangeText: (value: string) => void;
  placeholder?: string;
  unitLabel: string;
  value: string;
};

export function ProfileNumberField({
  accessibilityLabel,
  editable = true,
  errorMessage,
  label,
  onBlur,
  onChangeText,
  placeholder,
  unitLabel,
  value,
}: ProfileNumberFieldProps) {
  const theme = useAppTheme();
  const palette = Colors[theme];

  return (
    <View style={styles.field}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <ThemedView
        style={[
          styles.inputContainer,
          {
            backgroundColor: palette.card,
            borderColor: palette.border,
          },
        ]}>
        <TextInput
          accessibilityLabel={accessibilityLabel ?? label}
          editable={editable}
          keyboardType="decimal-pad"
          onBlur={onBlur}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={palette.mutedText}
          selectionColor={palette.tint}
          style={[
            styles.input,
            {
              color: palette.text,
              opacity: editable ? 1 : 0.7,
            },
          ]}
          value={value}
        />
        <ThemedText style={{ color: palette.mutedText }}>{unitLabel}</ThemedText>
      </ThemedView>
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
  inputContainer: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
});
