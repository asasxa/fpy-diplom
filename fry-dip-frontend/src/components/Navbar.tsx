import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logoutUser } from '../store/slices/authSlice';

export const Navbar = () => {
  const { isAuthenticated, is_admin } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  const isActive = (path: string) => location.pathname === path;

  const linkStyle = (path: string): React.CSSProperties => ({
    textDecoration: 'none',
    color: isActive(path) ? '#0a58ca' : '#6c757d',
    fontWeight: isActive(path) ? 600 : 400,
    borderBottom: isActive(path) ? '2px solid #0d6efd' : '2px solid transparent',
    paddingBottom: '0.25rem'
  });

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <Link to="/" style={linkStyle('/')}>Главная</Link>
        <Link to="/storage" style={linkStyle('/storage')}>Хранилище</Link>
        {is_admin && <Link to="/admin" style={linkStyle('/admin')}>Админка</Link>}
      </div>
      <div style={styles.right}>
        {isAuthenticated ? (
          <button onClick={handleLogout} style={styles.btn}>Выход</button>
        ) : (
          <>
            <Link to="/login" style={linkStyle('/login')}>Вход</Link>
            <Link to="/register" style={linkStyle('/register')}>Регистрация</Link>
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
  btn: { padding: '0.5rem 1rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};