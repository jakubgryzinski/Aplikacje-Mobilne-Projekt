import { useTranslation } from 'react-i18next';

import { CenteredTabHeader } from './components/CenteredTabHeader';

export default function NewTrainingScreen() {
  const { t } = useTranslation();

  return <CenteredTabHeader title={t('tabScreens.newTraining.title')} />;
}
