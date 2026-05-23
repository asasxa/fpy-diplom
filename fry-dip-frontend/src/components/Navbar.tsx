import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logoutUser } from '../store/slices/authSlice';

export const Navbar = () => {
  const { isAuthenticated, is_admin } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <Link to="/" style={styles.link}>Главная</Link>
        {isAuthenticated && <Link to="/storage" style={styles.link}>Хранилище</Link>}
        {isAuthenticated && is_admin && <Link to="/admin" style={styles.link}>Админка</Link>}
      </div>
      <div style={styles.right}>
        {isAuthenticated ? (
          <div style={styles.rightGroup}>
            {is_admin && <span style={styles.badge}>Admin</span>}
            <button onClick={handleLogout} style={styles.btn}>Выход</button>
          </div>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Вход</Link>
            <Link to="/register" style={styles.link}>Регистрация</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles: Record<string, React.CSSProperties> = {
  nav: { display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', background: '#fff', borderBottom: '1px solid #e9ecef', alignItems: 'center' },
  left: { display: 'flex', gap: '2rem' },
  right: { display: 'flex', gap: '1.5rem', alignItems: 'center' },
  rightGroup: { display: 'flex', gap: '1rem', alignItems: 'center' },
  link: { textDecoration: 'none', color: '#0d6efd', fontWeight: 500 },
  btn: { padding: '0.5rem 1rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  badge: { background: '#ffc107', color: '#000', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px' }
};