import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scissors } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-panel" style={{ margin: '1rem', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Scissors color="var(--accent-primary)" size={28} />
        <h2 style={{ margin: 0 }}>ClickBeard</h2>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Olá, {user?.name}</span>
        <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
          Sair
        </button>
      </div>
    </nav>
  );
}
