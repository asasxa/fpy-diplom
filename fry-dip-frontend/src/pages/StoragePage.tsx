import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchFiles, uploadFile, deleteFile, updateFile, FileItem } from '../store/slices/filesSlice';
import { formatBytes, formatDate } from '../utils/format';
import api from '../api/client';

export const StoragePage = () => {
  const { items, status, error, next, previous } = useAppSelector(state => state.files);
  const dispatch = useAppDispatch();

  const [selectedFile, setSelected] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editComment, setEditComment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchFiles({ page: currentPage }));
  }, [dispatch, currentPage]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    await dispatch(uploadFile({ file: selectedFile, comment }));
    setSelected(null); setComment(''); setUploading(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Удалить файл?')) dispatch(deleteFile(id));
  };

  const handleStartEdit = (file: FileItem) => {
    setEditingId(file.id);
    setEditName(file.original_name);
    setEditComment(file.comment);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const result = await dispatch(updateFile({ id: editingId, data: { original_name: editName, comment: editComment } }));
    if (updateFile.fulfilled.match(result)) {
      setEditingId(null);
    } else {
      alert('Ошибка сохранения: ' + (result.payload?.error || 'Неизвестная ошибка'));
    }
  };

  const handleCopyLink = async (link: string) => {
    const fullLink = `${window.location.origin}/api/files/special/${link}/`;
    try {
      await navigator.clipboard.writeText(fullLink);
      alert('Ссылка скопирована в буфер обмена');
    } catch { alert('Не удалось скопировать ссылку'); }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      const response = await api.get(`/files/${file.id}/download/`, { responseType: 'blob', withCredentials: true });
      const contentType = (response.headers['content-type'] as string) || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.original_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      if (err.response?.status === 401) alert('Сессия истекла или не найдена. Пожалуйста, выйдите и войдите снова.');
      else alert('Ошибка скачивания: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handlePreview = (file: FileItem) => {
    window.open(`/api/files/${file.id}/download/?preview=1`, '_blank');
  };

  if (status === 'loading' && items.length === 0) return <div style={{padding:'2rem'}}>Загрузка хранилища...</div>;
  if (error) return <div style={{padding:'2rem', color:'#dc3545'}}>Ошибка: {error}</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Моё хранилище</h2>
      <form onSubmit={handleUpload} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
        <input type="file" onChange={e => setSelected(e.target.files?.[0] || null)} required style={{ flex: '1 1 300px' }} />
        <input placeholder="Комментарий к файлу" value={comment} onChange={e => setComment(e.target.value)} style={{ flex: '2 1 300px' }} />
        <button type="submit" disabled={uploading} style={styles.btn}>{uploading ? 'Загрузка...' : 'Загрузить файл'}</button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #dee2e6' }}>
            <th style={styles.th}>Имя файла</th>
            <th style={styles.th}>Комментарий</th>
            <th style={styles.th}>Размер</th>
            <th style={styles.th}>Загружен</th>
            <th style={styles.th}>Скачан</th>
            <th style={styles.th}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map(f => (
            <tr key={f.id} style={{ borderBottom: '1px solid #eee' }}>
              {editingId === f.id ? (
                <>
                  <td><input value={editName} onChange={e => setEditName(e.target.value)} style={styles.input} /></td>
                  <td><input value={editComment} onChange={e => setEditComment(e.target.value)} style={styles.input} /></td>
                  <td colSpan={2}></td>
                  <td><button onClick={handleSaveEdit} style={{...styles.btn, background:'#198754'}}>Сохранить</button></td>
                </>
              ) : (
                <>
                  <td style={styles.td}>{f.original_name}</td>
                  <td style={styles.td}>{f.comment || '—'}</td>
                  <td style={styles.td}>{formatBytes(f.size)}</td>
                  <td style={styles.td}>{formatDate(f.uploaded_at)}</td>
                  <td style={styles.td}>{f.last_downloaded_at ? formatDate(f.last_downloaded_at) : '—'}</td>
                  <td style={{ ...styles.td, display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handlePreview(f)} style={styles.btnAction} title="Предпросмотр">👁️</button>
                    <button onClick={() => handleDownload(f)} style={styles.btnAction} title="Скачать">⬇️</button>
                    <button onClick={() => handleStartEdit(f)} style={styles.btnAction} title="Редактировать">✏️</button>
                    <button onClick={() => handleDelete(f.id)} style={styles.btnAction} title="Удалить">🗑️</button>
                    <button onClick={() => handleCopyLink(f.special_link)} style={styles.btnAction} title="Скопировать ссылку">🔗</button>
                  </td>
                </>
              )}
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>Хранилище пусто. Загрузите первый файл!</td></tr>}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
        <button
          onClick={() => setCurrentPage(p => p - 1)}
          disabled={!previous || status === 'loading'}
          style={{ ...styles.btn, opacity: !previous || status === 'loading' ? 0.5 : 1 }}
        >
          ← Назад
        </button>
        <span style={{ padding: '0.5rem', fontWeight: 500 }}>Страница {currentPage}</span>
        <button
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={!next || status === 'loading'}
          style={{ ...styles.btn, opacity: !next || status === 'loading' ? 0.5 : 1 }}
        >
          Вперёд →
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  th: { textAlign: 'left', padding: '0.75rem', background: '#f8f9fa' },
  td: { padding: '0.75rem' },
  input: { width: '100%', padding: '0.4rem', border: '1px solid #ced4da', borderRadius: '4px' },
  btn: { padding: '0.6rem 1rem', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  btnAction: { background: 'transparent', border: '1px solid #ced4da', borderRadius: '4px', cursor: 'pointer', padding: '0.3rem 0.5rem' }
};