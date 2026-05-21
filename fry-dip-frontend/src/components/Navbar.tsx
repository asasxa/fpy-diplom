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
        <Link to="/storage" style={styles.link}>Хранилище</Link>
        {is_admin && <Link to="/admin" style={styles.link}>Админка</Link>}
      </div>
      <div style={styles.right}>
        {isAuthenticated ? (
          <button onClick={handleLogout} style={styles.btn}>Выход</button>
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
  link: { textDecoration: 'none', color: '#0d6efd', fontWeight: 500 },
  btn: { padding: '0.5rem 1rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};