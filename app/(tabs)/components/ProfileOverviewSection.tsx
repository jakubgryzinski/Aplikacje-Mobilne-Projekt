import { StyleSheet, View } from 'react-native';

import { ProfileAvatarSection } from './ProfileAvatarSection';
import { ProfileDetailsForm } from './ProfileDetailsForm';

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
