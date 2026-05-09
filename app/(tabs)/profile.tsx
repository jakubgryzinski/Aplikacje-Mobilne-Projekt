import { useTranslation } from 'react-i18next';

import { CenteredTabHeader } from './components/centered-tab-header';

export default function ProfileScreen() {
  const { t } = useTranslation();

  return <CenteredTabHeader title={t('tabScreens.profile.title')} />;
}
