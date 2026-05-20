import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { ValidationError } from '../types';

export const RegisterPage = () => {
  const [form, setForm] = useState({ username: '', full_name: '', email: '', password: '' });
  const [errors, setErrors] = useState<ValidationError>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs: ValidationError = {};
    if (!/^[a-zA-Z][a-zA-Z0-9]{3,19}$/.test(form.username)) errs.username = 'Логин: 4-20 символов, начинается с буквы, только латиница и цифры';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Некорректный email';
    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?\":{}|<>]).{6,}$/.test(form.password))
      errs.password = 'Мин. 6 символов: заглавная, цифра, спецсимвол';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      await api.post('/users/register/', form);
      navigate('/login', { state: { success: 'Регистрация успешна. Войдите.' } });
    } catch (err: any) {
      setErrors(err.response?.data || { error: 'Ошибка регистрации' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
  };

  return (
    <div style={styles.container}>
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {['username', 'full_name', 'email', 'password'].map(field => (
          <div key={field}>
            <input name={field} style={styles.input} placeholder={field === 'full_name' ? 'Полное имя' : field}
              type={field === 'password' ? 'password' : 'text'} value={(form as any)[field]} onChange={handleChange} required />
            {(errors as any)[field] && <p style={styles.error}>{(errors as any)[field]}</p>}
          </div>
        ))}
        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? 'Создание...' : 'Зарегистрироваться'}
        </button>
        <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
      </form>
    </div>
  );
};

const styles = { container: { maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }, form: { display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' }, input: { padding: '0.75rem', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '4px' }, btn: { padding: '0.75rem', background: '#198754', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }, error: { color: '#dc3545', margin: '0.25rem 0 0', fontSize: '0.8rem' } };