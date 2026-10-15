import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { IconArrowLeft } from '../components/icons';

export function NotFoundPage() {
  const { t } = useI18n();

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 620, textAlign: 'center' }}>
        <span className="eyebrow">404</span>
        <h1>{t('notfound.title')}</h1>
        <p>{t('notfound.desc')}</p>
        <Link className="btn btn--primary" to="/">
          <IconArrowLeft size={16} />
          {t('notfound.cta')}
        </Link>
      </div>
    </div>
  );
}
