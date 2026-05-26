import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface ValidationError {
  [key: string]: string | string[];
}

export const RegisterPage = () => {
  const [form, setForm] = useState({ username: '', full_name: '', email: '', password: '', confirm_password: '' });
  const [errors, setErrors] = useState<ValidationError>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users/register/', form);
      navigate('/login');
    } catch (err: any) {
      if (err.response?.status === 400) setErrors(err.response.data);
      else setErrors({ form: 'Ошибка сети или сервера' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '3rem auto', padding: '2rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <input name="username" placeholder="Логин" value={form.username} onChange={handleChange} style={styles.input} required />
          {errors.username && <div style={styles.error}>{Array.isArray(errors.username) ? errors.username.join(', ') : errors.username}</div>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <input name="full_name" placeholder="Полное имя" value={form.full_name} onChange={handleChange} style={styles.input} required />
          {errors.full_name && <div style={styles.error}>{Array.isArray(errors.full_name) ? errors.full_name.join(', ') : errors.full_name}</div>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} style={styles.input} required />
          {errors.email && <div style={styles.error}>{Array.isArray(errors.email) ? errors.email.join(', ') : errors.email}</div>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <input name="password" type="password" placeholder="Пароль" value={form.password} onChange={handleChange} style={styles.input} required />
          {errors.password && <div style={styles.error}>{Array.isArray(errors.password) ? errors.password.join(', ') : errors.password}</div>}
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <input name="confirm_password" type="password" placeholder="Подтвердите пароль" value={form.confirm_password} onChange={handleChange} style={styles.input} required />
        </div>
        {errors.form && <div style={{...styles.error, marginBottom:'1rem'}}>{errors.form}</div>}
        <button type="submit" disabled={loading} style={styles.btn}>{loading ? 'Регистрация...' : 'Зарегистрироваться'}</button>
      </form>
    </div>
  );
};

const styles = {
  input: { width: '100%', padding: '0.75rem', marginBottom: '0.25rem', border: '1px solid #ced4da', borderRadius: '4px', boxSizing: 'border-box' as const },
  btn: { width: '100%', padding: '0.75rem', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' },
  error: { color: '#dc3545', fontSize: '0.85rem', marginTop: '0.25rem' }
};