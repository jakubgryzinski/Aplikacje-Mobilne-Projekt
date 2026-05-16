import { Modal, Pressable, StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

import { ProfileActionButton } from './profile-action-button';

type ProfileAvatarActionSheetAction = {
  label: string;
  onPress: () => void;
};

type ProfileAvatarActionSheetProps = {
  actions: ProfileAvatarActionSheetAction[];
  onClose: () => void;
  visible: boolean;
  disabled?: boolean;
};

export function ProfileAvatarActionSheet({
  actions,
  onClose,
  visible,
  disabled = false,
}: ProfileAvatarActionSheetProps) {
  const theme = useAppTheme();
  const palette = Colors[theme];

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      transparent
      visible={visible}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onClose}
        style={styles.backdrop}>
        <Pressable
          accessibilityViewIsModal
          onPress={() => undefined}
          style={styles.sheetContainer}>
          <ThemedView
            style={[
              styles.sheet,
              {
                backgroundColor: palette.background,
                borderColor: palette.border,
              },
            ]}>
            {actions.map((action, index) => (
              <ProfileActionButton
                key={`${action.label}-${index}`}
                disabled={disabled}
                label={action.label}
                onPress={action.onPress}
              />
            ))}
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'flex-end',
  },
  sheet: {
    gap: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  sheetContainer: {
    width: '100%',
  },
});
