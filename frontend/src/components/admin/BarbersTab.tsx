import { useState } from 'react';
import { api } from '../../services/api';
import { format } from 'date-fns';

interface BarbersTabProps {
  barbers: any[];
  specialties: any[];
  loadData: () => void;
  setError: (msg: string) => void;
  setSuccess: (msg: string) => void;
  requestDeleteBarber: (id: string) => void;
}

export default function BarbersTab({ barbers, specialties, loadData, setError, setSuccess, requestDeleteBarber }: BarbersTabProps) {
  const [editingBarberId, setEditingBarberId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [hiringDate, setHiringDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  const handleSpecialtyToggle = (id: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const startEditBarber = (barber: any) => {
    setEditingBarberId(barber.id);
    setName(barber.name);
    setAge(barber.age.toString());
    setHiringDate(format(new Date(barber.hiringDate), 'yyyy-MM-dd'));
    setSelectedSpecialties(barber.specialties.map((s: any) => s.specialtyId));
  };

  const cancelEditBarber = () => {
    setEditingBarberId(null);
    setName('');
    setAge('');
    setHiringDate(format(new Date(), 'yyyy-MM-dd'));
    setSelectedSpecialties([]);
  };

  const handleSaveBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSpecialties.length === 0) {
      setError('Selecione pelo menos uma especialidade.');
      return;
    }
    try {
      setError('');
      if (editingBarberId) {
        await api.put(`/barbers/${editingBarberId}`, {
          name,
          age: parseInt(age, 10),
          hiringDate,
          specialtyIds: selectedSpecialties
        });
        setSuccess('Barbeiro atualizado com sucesso!');
      } else {
        await api.post('/barbers', {
          name,
          age: parseInt(age, 10),
          hiringDate,
          specialtyIds: selectedSpecialties
        });
        setSuccess('Barbeiro cadastrado com sucesso!');
      }
      setTimeout(() => setSuccess(''), 3000);
      cancelEditBarber();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 className="mb-3">{editingBarberId ? 'Editar Barbeiro' : 'Cadastrar Novo Barbeiro'}</h3>
        
        <form onSubmit={handleSaveBarber} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="mb-1" style={{ display: 'block' }}>Nome</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="mb-1" style={{ display: 'block' }}>Idade</label>
              <input type="number" required min="16" max="90" value={age} onChange={e => setAge(e.target.value)} />
            </div>
            <div>
              <label className="mb-1" style={{ display: 'block' }}>Data de Contratação</label>
              <input type="date" required value={hiringDate} onChange={e => setHiringDate(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="mb-2" style={{ display: 'block' }}>Especialidades (Selecione pelo menos uma):</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {specialties.map(spec => (
                <button 
                  key={spec.id} 
                  type="button"
                  className={`btn ${selectedSpecialties.includes(spec.id) ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  onClick={() => handleSpecialtyToggle(spec.id)}
                >
                  {spec.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            {editingBarberId && (
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={cancelEditBarber}>Cancelar</button>
            )}
            <button type="submit" className="btn btn-primary" style={{ flex: editingBarberId ? 1 : 'none', width: editingBarberId ? 'auto' : '100%' }}>
              {editingBarberId ? 'Salvar Alterações' : 'Salvar Barbeiro'}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 className="mb-3">Barbeiros Cadastrados</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
          {barbers.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Nenhum barbeiro cadastrado.</p>}
          {barbers.map(barb => (
            <div key={barb.id} style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--border-radius-sm)', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>{barb.name} <span style={{ fontSize: '0.8rem', opacity: 0.7, fontWeight: 'normal' }}>({barb.age} anos)</span></h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderColor: 'transparent' }} onClick={() => startEditBarber(barb)}>Editar</button>
                  <button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => requestDeleteBarber(barb.id)}>Remover</button>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <strong>Especialidades:</strong> {barb.specialties.map((s: any) => s.specialty.name).join(', ')}
              </p>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
