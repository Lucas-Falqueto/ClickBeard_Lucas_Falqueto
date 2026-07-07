import { useState } from 'react';
import { api } from '../../services/api';

interface SpecialtiesTabProps {
  specialties: any[];
  loadData: () => void;
  setError: (msg: string) => void;
  setSuccess: (msg: string) => void;
  requestDeleteSpecialty: (id: string) => void;
}

export default function SpecialtiesTab({ specialties, loadData, setError, setSuccess, requestDeleteSpecialty }: SpecialtiesTabProps) {
  const [specName, setSpecName] = useState('');
  const [specDesc, setSpecDesc] = useState('');

  const handleCreateSpecialty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await api.post('/specialties', {
        name: specName,
        description: specDesc
      });
      setSuccess('Especialidade criada com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
      setSpecName('');
      setSpecDesc('');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 className="mb-3">Nova Especialidade</h3>
        
        <form onSubmit={handleCreateSpecialty} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="mb-1" style={{ display: 'block' }}>Nome do Serviço</label>
            <input type="text" required value={specName} onChange={e => setSpecName(e.target.value)} placeholder="Ex: Corte Degadê" />
          </div>
          
          <div>
            <label className="mb-1" style={{ display: 'block' }}>Descrição</label>
            <textarea required rows={3} value={specDesc} onChange={e => setSpecDesc(e.target.value)} placeholder="Breve descrição do serviço" />
          </div>

          <button type="submit" className="btn btn-primary mt-4">Salvar Especialidade</button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 className="mb-3">Especialidades Cadastradas</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
          {specialties.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Nenhuma especialidade cadastrada.</p>}
          {specialties.map(spec => (
            <div key={spec.id} style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--border-radius-sm)', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0' }}>{spec.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{spec.description}</p>
                </div>
                <button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', marginLeft: '1rem' }} onClick={() => requestDeleteSpecialty(spec.id)}>Remover</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
