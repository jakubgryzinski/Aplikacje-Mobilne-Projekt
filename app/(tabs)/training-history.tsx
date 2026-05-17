import { useTranslation } from 'react-i18next';

import { CenteredTabHeader } from './components/CenteredTabHeader';

export default function TrainingHistoryScreen() {
  const { t } = useTranslation();

  return <CenteredTabHeader title={t('tabScreens.trainingHistory.title')} />;
}
