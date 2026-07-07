import { useState } from 'react';
import AppointmentsList from './AppointmentsList';

export default function AppointmentsTab() {
  const [subTab, setSubTab] = useState<'today' | 'future'>('today');

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        <button 
          className={`btn ${subTab === 'today' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setSubTab('today')}
          style={{ padding: '0.5rem 1rem' }}
        >
          Hoje
        </button>
        <button 
          className={`btn ${subTab === 'future' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setSubTab('future')}
          style={{ padding: '0.5rem 1rem' }}
        >
          Futuros
        </button>
      </div>

      {subTab === 'today' && <AppointmentsList type="today" />}
      {subTab === 'future' && <AppointmentsList type="future" />}
    </div>
  );
}
