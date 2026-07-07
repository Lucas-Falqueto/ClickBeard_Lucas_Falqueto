import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

import { Scissors } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await api.post('/auth/register', { name, email, password });
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-4">
          <Scissors color="var(--accent-primary)" size={48} style={{ margin: '0 auto' }} />
          <h2 className="mt-4">Cadastro</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Crie sua conta no ClickBeard</p>
        </div>
        
        {error && <div style={{ background: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="mb-1" style={{ display: 'block' }}>Nome completo</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1" style={{ display: 'block' }}>E-mail</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="mb-1" style={{ display: 'block' }}>Senha</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary mt-4">Criar conta</button>
        </form>
        
        <div className="text-center mt-4">
          <span style={{ color: 'var(--text-secondary)' }}>Já tem conta? </span>
          <Link to="/login">Faça Login</Link>
        </div>
      </div>
    </div>
  );
}
