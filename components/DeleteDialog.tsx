import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type DeleteDialogProps = {
  isOpen: boolean;
  message: string;
  onCancel: () => void;
  onSubmit: () => void;
};

export function DeleteDialog({ isOpen, message, onCancel, onSubmit }: DeleteDialogProps) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = Colors[theme];

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      presentationStyle="overFullScreen"
      transparent
      visible>
      <Pressable accessibilityRole="button" onPress={onCancel} style={styles.backdrop}>
        <Pressable accessibilityViewIsModal onPress={() => undefined} style={styles.dialogContainer}>
          <ThemedView
            style={[
              styles.dialog,
              {
                borderColor: palette.border,
              },
            ]}>
            <ThemedText type="defaultSemiBold">{message}</ThemedText>

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={onCancel}
                style={[
                  styles.button,
                  {
                    backgroundColor: palette.card,
                    borderColor: palette.border,
                  },
                ]}>
                <ThemedText type="defaultSemiBold">
                  {t('common.deleteDialog.cancelAction')}
                </ThemedText>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={onSubmit}
                style={[
                  styles.button,
                  {
                    backgroundColor: palette.tint,
                    borderColor: palette.tint,
                  },
                ]}>
                <ThemedText
                  type="defaultSemiBold"
                  style={{ color: palette.background }}>
                  {t('common.deleteDialog.submitAction')}
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000066',
    padding: 20,
  },
  button: {
    minHeight: 44,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dialog: {
    gap: 20,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 360,
  },
});
