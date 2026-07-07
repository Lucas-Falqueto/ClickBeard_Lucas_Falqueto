import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ClientDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Wizard state
  const [step, setStep] = useState(0);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: '' });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [apps, specs, barbs] = await Promise.all([
        api.get('/appointments/me'),
        api.get('/specialties'),
        api.get('/barbers')
      ]);
      setAppointments(apps);
      setSpecialties(specs);
      setBarbers(barbs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async (barberId: string, date: string) => {
    try {
      const available = await api.get(`/appointments/available?barberId=${barberId}&date=${date}`);
      setSlots(available);
    } catch (err) {
      console.error(err);
    }
  };

  const requestCancel = (id: string) => {
    setConfirmModal({ isOpen: true, id });
  };

  const handleCancel = async () => {
    const id = confirmModal.id;
    setConfirmModal({ isOpen: false, id: '' });
    try {
      await api.delete(`/appointments/${id}`);
      setSuccess('Agendamento cancelado com sucesso.');
      setTimeout(() => setSuccess(''), 3000);
      loadDashboard();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleBook = async () => {
    try {
      setError('');
      await api.post('/appointments', {
        barberId: selectedBarber,
        specialtyId: selectedSpecialty,
        scheduledAt: selectedSlot
      });
      setSuccess('Agendamento realizado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
      setStep(0);
      setSelectedSlot('');
      loadDashboard();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredBarbers = barbers.filter(b => b.specialties.some((bs: any) => bs.specialtyId === selectedSpecialty));

  if (loading) return <div className="text-center mt-4">Carregando...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
      <h2 className="mb-4">Minha Área</h2>
      
      {error && <div className="animate-fade-in" style={{ background: 'var(--danger)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', marginBottom: '2rem', textAlign: 'center' }}>{error}</div>}
      {success && <div className="animate-fade-in" style={{ background: 'var(--success)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', marginBottom: '2rem', textAlign: 'center', color: '#fff', fontWeight: 500 }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* WIZARD */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 className="mb-3">Novo Agendamento</h3>
          
          {step === 0 && (
            <div className="animate-fade-in">
              <p className="mb-2 text-secondary">Escolha o serviço:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {specialties.map(spec => (
                  <button key={spec.id} className="btn btn-outline" onClick={() => { setSelectedSpecialty(spec.id); setStep(1); }}>
                    {spec.name} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>({spec.description})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-in">
              <p className="mb-2 text-secondary">Escolha o barbeiro:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filteredBarbers.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>Nenhum barbeiro faz este serviço.</p> : filteredBarbers.map(barb => (
                  <button key={barb.id} className="btn btn-outline" onClick={() => { 
                    setSelectedBarber(barb.id); 
                    loadSlots(barb.id, selectedDate);
                    setStep(2); 
                  }}>
                    {barb.name}
                  </button>
                ))}
              </div>
              <button className="btn btn-outline mt-4" style={{ borderColor: 'transparent', display: 'block', margin: '1rem auto 0' }} onClick={() => setStep(0)}>Voltar</button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <p className="mb-2 text-secondary">Escolha a data e o horário:</p>
              <input type="date" className="mb-3" value={selectedDate} min={format(new Date(), 'yyyy-MM-dd')} onChange={(e) => {
                setSelectedDate(e.target.value);
                loadSlots(selectedBarber, e.target.value);
              }} />
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {slots.length === 0 ? <p style={{ gridColumn: 'span 3', color: 'var(--text-secondary)' }}>Nenhum horário livre.</p> : slots.map((s: string) => (
                  <button key={s} className={`btn ${selectedSlot === s ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.5rem' }} onClick={() => setSelectedSlot(s)}>
                    {format(new Date(s), 'HH:mm')}
                  </button>
                ))}
              </div>

              {selectedSlot && (
                <button className="btn btn-primary mt-4" style={{ width: '100%' }} onClick={handleBook}>Confirmar Agendamento</button>
              )}
              
              <div className="text-center mt-2">
                <button className="btn btn-outline mt-2" style={{ borderColor: 'transparent' }} onClick={() => { setStep(1); setSelectedSlot(''); }}>Voltar</button>
              </div>
            </div>
          )}
        </div>

        {/* MEUS AGENDAMENTOS */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 className="mb-3">Meus Agendamentos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
            {appointments.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Você não tem agendamentos.</p>}
            {appointments.map(app => (
              <div key={app.id} style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--border-radius-sm)', background: 'rgba(0,0,0,0.2)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>{format(new Date(app.scheduledAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</h4>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>
                  {app.specialty.name} com {app.barber.name}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem',
                    background: app.status === 'scheduled' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: app.status === 'scheduled' ? 'var(--accent-primary)' : 'var(--danger)'
                  }}>
                    {app.status === 'scheduled' ? 'Confirmado' : 'Cancelado'}
                  </span>
                  
                  {app.status === 'scheduled' && (
                    <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => requestCancel(app.id)}>Cancelar</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {confirmModal.isOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content">
            <h3 className="mb-2">Cancelar Agendamento</h3>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Tem certeza que deseja cancelar este agendamento? (Ação permitida apenas até 2h antes do horário marcado)</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setConfirmModal({ isOpen: false, id: '' })}>Voltar</button>
              <button className="btn btn-danger" onClick={handleCancel}>Sim, Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
