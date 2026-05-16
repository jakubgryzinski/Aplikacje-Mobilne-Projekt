import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import {
  isProfileAvatarError,
  pickProfileAvatar,
  saveProfileAvatar,
} from '@/store/profile-actions';
import { useProfileStore } from '@/store/profile-store';

import { ProfileAvatarActionSheet } from './profile-avatar-action-sheet';

const errorTextColor = {
  dark: '#FF8A80',
  light: '#C62828',
} as const;

export function ProfileAvatarSection() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = Colors[theme];
  const avatarUri = useProfileStore((state) => state.profileDetails.avatarUri);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const actionLabel = avatarUri
    ? t('tabScreens.profile.avatar.changeAction')
    : t('tabScreens.profile.avatar.chooseAction');

  const sheetActions = [
    {
      label: t('tabScreens.profile.avatar.changeAction'),
      onPress: () => {
        void onChooseAvatar();
      },
    },
    {
      label: t('tabScreens.profile.avatar.removeAction'),
      onPress: () => {
        void onRemoveAvatar();
      },
    },
    {
      label: t('tabScreens.profile.avatar.cancelAction'),
      onPress: closeActionSheet,
    },
  ];

  function closeActionSheet() {
    if (isSubmitting) {
      return;
    }

    setIsActionSheetVisible(false);
  }

  async function onChooseAvatar() {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const selectedAvatarUri = await pickProfileAvatar();

      setIsActionSheetVisible(false);

      if (selectedAvatarUri === null) {
        return;
      }

      await saveProfileAvatar(selectedAvatarUri);
    } catch (error) {
      setIsActionSheetVisible(false);

      if (isProfileAvatarError(error)) {
        setErrorMessage(
          error.code === 'permission-denied'
            ? t('tabScreens.profile.avatar.permissionDenied')
            : t('tabScreens.profile.avatar.pickerError')
        );
        return;
      }

      setErrorMessage(t('tabScreens.profile.avatar.pickerError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onRemoveAvatar() {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await saveProfileAvatar(null);
      setIsActionSheetVisible(false);
    } catch {
      setErrorMessage(t('tabScreens.profile.avatar.removeError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.section}>
      <ThemedText style={{ color: palette.mutedText }}>
        {t('tabScreens.profile.avatar.description')}
      </ThemedText>

      <ThemedView style={styles.avatarContent}>
        <ThemedView
          style={[
            styles.avatarFrame,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
            },
          ]}>
          {avatarUri ? (
            <Image
              accessibilityLabel={t('tabScreens.profile.avatar.defaultAlt')}
              contentFit="cover"
              source={{ uri: avatarUri }}
              style={styles.avatarImage}
            />
          ) : (
            <ThemedView
              style={[
                styles.avatarPlaceholder,
                {
                  backgroundColor: palette.background,
                },
              ]}>
              <IconSymbol color={palette.icon} name="person.fill" size={56} />
            </ThemedView>
          )}

          {isSubmitting ? (
            <ThemedView style={styles.loadingOverlay}>
              <ActivityIndicator color={palette.tint} />
            </ThemedView>
          ) : null}
        </ThemedView>

        <Pressable
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={() => {
            setErrorMessage(null);
            if (avatarUri) {
              setIsActionSheetVisible(true);
              return;
            }

            void onChooseAvatar();
          }}
          style={[
            styles.actionIconButton,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
              opacity: isSubmitting ? 0.6 : 1,
            },
          ]}>
          <IconSymbol color={palette.icon} name="plus.circle.fill" size={20} />
          <ThemedText type="defaultSemiBold" style={{ color: palette.mutedText }}>
            {actionLabel}
          </ThemedText>
        </Pressable>

        {!avatarUri ? (
          <ThemedText style={{ color: palette.mutedText }}>
            {t('tabScreens.profile.avatar.placeholder')}
          </ThemedText>
        ) : null}

        {errorMessage ? (
          <ThemedText style={{ color: errorTextColor[theme] }}>{errorMessage}</ThemedText>
        ) : null}
      </ThemedView>

      <ProfileAvatarActionSheet
        actions={sheetActions}
        disabled={isSubmitting}
        onClose={closeActionSheet}
        visible={avatarUri !== null && isActionSheetVisible}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  actionIconButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  avatarContent: {
    alignItems: 'center',
    gap: 12,
  },
  avatarFrame: {
    width: 144,
    height: 144,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 999,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000022',
  },
  section: {
    gap: 12,
  },
});
