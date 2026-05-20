import { Link } from 'react-router-dom';

export const HomePage = () => (
  <div style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#0d6efd' }}>My Cloud</h1>
    <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#495057', marginBottom: '2rem' }}>
      Безопасное облачное хранилище для ваших файлов. Загружайте, управляйте метаданными,
      скачивайте и делитесь файлами по обезличенным ссылкам.
    </p>
    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
      <Link to="/login" style={styles.btn}>Войти в аккаунт</Link>
      <Link to="/register" style={{...styles.btn, background: '#6c757d'}}>Регистрация</Link>
    </div>
  </div>
);

const styles = {
  btn: { padding: '0.75rem 1.5rem', background: '#0d6efd', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: 500 }
};