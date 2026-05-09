import { useTranslation } from 'react-i18next';

import { CenteredTabHeader } from './components/centered-tab-header';

export default function TabTwoScreen() {
  const { t } = useTranslation();

  return <CenteredTabHeader title={t('exploreScreen.title')} />;
}
