import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUsers, deleteUser, updateAdminStatus } from '../store/slices/usersSlice';

export const AdminPage = () => {
  const { items, status, error } = useAppSelector(state => state.users);
  const currentUser = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);

  const handleToggleAdmin = (user: any) => {
    dispatch(updateAdminStatus({ id: user.id, is_admin: !user.is_admin }));
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Удалить пользователя?')) dispatch(deleteUser(id));
  };

  if (status === 'loading') return <div style={{padding:'2rem'}}>Загрузка...</div>;
  if (error) return <div style={{padding:'2rem', color:'red'}}>Ошибка: {error}</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Управление пользователями</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #dee2e6' }}>
            <th style={styles.th}>Логин</th>
            <th style={styles.th}>Имя</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Админ</th>
            <th style={styles.th}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={styles.td}>{u.username}</td>
              <td style={styles.td}>{u.full_name}</td>
              <td style={styles.td}>{u.email}</td>
              <td style={styles.td}>
                <input
                  type="checkbox"
                  checked={u.is_admin}
                  onChange={() => handleToggleAdmin(u)}
                  disabled={u.id === (currentUser as any).id}
                />
              </td>
              <td style={styles.td}>
                <button
                  onClick={() => handleDelete(u.id)}
                  disabled={u.id === (currentUser as any).id}
                  style={styles.btnAction}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={5} style={{textAlign:'center', padding:'2rem'}}>Нет пользователей</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  th: { textAlign: 'left', padding: '0.75rem', background: '#f8f9fa' },
  td: { padding: '0.75rem' },
  btnAction: { background: 'transparent', border: '1px solid #dc3545', color: '#dc3545', borderRadius: '4px', cursor: 'pointer', padding: '0.3rem 0.5rem' }
};