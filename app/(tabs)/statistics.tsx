import { useTranslation } from 'react-i18next';

import { CenteredTabHeader } from './components/CenteredTabHeader';

export default function StatisticsScreen() {
  const { t } = useTranslation();

  return <CenteredTabHeader title={t('tabScreens.statistics.title')} />;
}
