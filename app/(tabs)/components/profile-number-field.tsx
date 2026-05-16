import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export type ProfileNumberFieldProps = {
  accessibilityLabel?: string;
  editable?: boolean;
  label: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  unitLabel: string;
  value: string;
};

export function ProfileNumberField({
  accessibilityLabel,
  editable = true,
  label,
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
