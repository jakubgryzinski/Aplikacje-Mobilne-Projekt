import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type OptionToggleGroupOption<T extends string> = {
  label: string;
  value: T;
};

type OptionToggleGroupProps<T extends string> = {
  accessibilityLabel: string;
  disabled?: boolean;
  onChange: (value: T) => void;
  options: [OptionToggleGroupOption<T>, OptionToggleGroupOption<T>];
  selectedValue: T | null;
};

export function OptionToggleGroup<T extends string>({
  accessibilityLabel,
  disabled = false,
  onChange,
  options,
  selectedValue,
}: OptionToggleGroupProps<T>) {
  const theme = useAppTheme();
  const palette = Colors[theme];

  return (
    <ThemedView style={[styles.group, { backgroundColor: palette.card, borderColor: palette.border }]}>
      {options.map((option) => {
        const isSelected = option.value === selectedValue;

        return (
          <Pressable
            key={option.value}
            accessibilityLabel={`${accessibilityLabel}: ${option.label}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            style={[
              styles.option,
              {
                backgroundColor: isSelected ? palette.selectedBackground : palette.background,
                borderColor: isSelected ? palette.tint : palette.border,
                opacity: disabled ? 0.7 : 1,
              },
            ]}>
            <ThemedText
              type="defaultSemiBold"
              style={{ color: isSelected ? palette.selectedText : palette.text }}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  option: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
