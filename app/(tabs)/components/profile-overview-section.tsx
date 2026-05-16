import { StyleSheet, View } from 'react-native';

import { ProfileAvatarSection } from './profile-avatar-section';
import { ProfileDetailsForm } from './profile-details-form';

export function ProfileOverviewSection() {
  return (
    <View style={styles.content}>
      <ProfileAvatarSection />
      <ProfileDetailsForm />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
  },
});
