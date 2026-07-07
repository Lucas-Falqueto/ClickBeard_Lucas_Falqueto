import { useState, useEffect } from 'react';
import { api } from '../services/api';
import AppointmentsTab from '../components/admin/AppointmentsTab';
import BarbersTab from '../components/admin/BarbersTab';
import SpecialtiesTab from '../components/admin/SpecialtiesTab';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'appointments' | 'barbers' | 'specialties'>('appointments');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, type: 'barber' | 'specialty' | '', id: string }>({ isOpen: false, type: '', id: '' });

  const [barbers, setBarbers] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [barbersData, specialtiesData] = await Promise.all([
        api.get('/barbers'),
        api.get('/specialties')
      ]);
      setBarbers(barbersData);
      setSpecialties(specialtiesData);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestDeleteBarber = (id: string) => setConfirmModal({ isOpen: true, type: 'barber', id });
  const requestDeleteSpecialty = (id: string) => setConfirmModal({ isOpen: true, type: 'specialty', id });

  const confirmDelete = async () => {
    const { type, id } = confirmModal;
    setConfirmModal({ isOpen: false, type: '', id: '' });
    
    try {
      setError('');
      if (type === 'barber') {
        await api.delete(`/barbers/${id}`);
        setSuccess('Barbeiro removido com sucesso!');
      } else if (type === 'specialty') {
        await api.delete(`/specialties/${id}`);
        setSuccess('Especialidade removida com sucesso!');
      }
      setTimeout(() => setSuccess(''), 3000);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  if (loading) return <div className="text-center mt-4">Carregando...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Painel Administrativo</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-outline'}`} 
            onClick={() => setActiveTab('appointments')}
          >
            Agendamentos
          </button>
          <button 
            className={`btn ${activeTab === 'barbers' ? 'btn-primary' : 'btn-outline'}`} 
            onClick={() => setActiveTab('barbers')}
          >
            Barbeiros
          </button>
          <button 
            className={`btn ${activeTab === 'specialties' ? 'btn-primary' : 'btn-outline'}`} 
            onClick={() => setActiveTab('specialties')}
          >
            Especialidades
          </button>
        </div>
      </div>

      {error && <div className="animate-fade-in" style={{ background: 'var(--danger)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', marginBottom: '2rem', textAlign: 'center' }}>{error}</div>}
      {success && <div className="animate-fade-in" style={{ background: 'var(--success)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', marginBottom: '2rem', textAlign: 'center', color: '#fff', fontWeight: 500 }}>{success}</div>}

      {activeTab === 'appointments' && (
        <AppointmentsTab />
      )}

      {activeTab === 'barbers' && !loading && (
        <BarbersTab 
          barbers={barbers} 
          specialties={specialties} 
          loadData={loadData} 
          setError={setError} 
          setSuccess={setSuccess} 
          requestDeleteBarber={requestDeleteBarber} 
        />
      )}

      {activeTab === 'specialties' && !loading && (
        <SpecialtiesTab 
          specialties={specialties} 
          loadData={loadData} 
          setError={setError} 
          setSuccess={setSuccess} 
          requestDeleteSpecialty={requestDeleteSpecialty} 
        />
      )}

      {confirmModal.isOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content">
            <h3 className="mb-2">Confirmar Exclusão</h3>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              {confirmModal.type === 'barber' ? 'Tem certeza que deseja remover este barbeiro permanentemente?' : 'Tem certeza que deseja remover esta especialidade? (Atenção: Apenas se não houver barbeiros atrelados a ela)'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setConfirmModal({ isOpen: false, type: '', id: '' })}>Cancelar</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Sim, Remover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
