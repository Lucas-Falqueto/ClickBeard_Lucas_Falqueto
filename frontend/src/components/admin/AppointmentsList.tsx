import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AppointmentsListProps {
  type: 'today' | 'future';
}

export default function AppointmentsList({ type }: AppointmentsListProps) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, action: 'cancel'|'complete'|'', id: string}>({ isOpen: false, action: '', id: '' });
  
  // Filters & Pagination
  const [clientName, setClientName] = useState('');
  const [status, setStatus] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const endpoint = type === 'today' ? '/appointments/admin/today' : '/appointments/admin/future';
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      if (clientName) params.append('clientName', clientName);
      if (status !== 'all') params.append('status', status);
      if (dateFilter && type === 'future') params.append('date', dateFilter);

      const response = await api.get(`${endpoint}?${params.toString()}`);
      
      setAppointments(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar agendamentos');
    } finally {
      setLoading(false);
    }
  }, [type, page, limit, clientName, status, dateFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset page on new search
    fetchAppointments();
  };

  const handleConfirm = async () => {
    if (!confirmModal.id) return;
    try {
      setError('');
      if (confirmModal.action === 'cancel') {
        await api.delete(`/appointments/${confirmModal.id}`);
        setSuccess('Agendamento cancelado com sucesso.');
      } else if (confirmModal.action === 'complete') {
        await api.patch(`/appointments/${confirmModal.id}/complete`, {});
        setSuccess('Agendamento marcado como concluído.');
      }
      setTimeout(() => setSuccess(''), 3000);
      setConfirmModal({ isOpen: false, action: '', id: '' });
      fetchAppointments();
    } catch (err: any) {
      setError(err.message || 'Erro ao processar a ação');
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Filters */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Buscar por nome do cliente..." 
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
          style={{ minWidth: '150px' }}
        >
          <option value="all">Todos os status</option>
          <option value="scheduled">Agendados</option>
          <option value="cancelled">Cancelados</option>
          <option value="completed">Concluídos</option>
        </select>
        
        {type === 'future' && (
          <input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            min={format(new Date(), 'yyyy-MM-dd')}
            style={{ minWidth: '150px' }}
          />
        )}
        
        <button type="submit" className="btn btn-primary">Buscar</button>
      </form>

      {error && <p className="animate-fade-in" style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}
      {success && <p className="animate-fade-in" style={{ color: 'var(--success)', marginBottom: '1rem' }}>{success}</p>}
      
      {loading ? (
        <p className="text-center" style={{ color: 'var(--text-secondary)' }}>Carregando...</p>
      ) : appointments.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>Nenhum agendamento encontrado.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {appointments.map(app => (
            <div key={app.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{format(new Date(app.scheduledAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  <strong>Cliente:</strong> {app.user.name} | <strong>Serviço:</strong> {app.specialty.name} | <strong>Barbeiro:</strong> {app.barber.name}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  background: app.status === 'scheduled' ? 'rgba(59, 130, 246, 0.2)' : app.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: app.status === 'scheduled' ? 'var(--accent-primary)' : app.status === 'completed' ? 'var(--success)' : 'var(--danger)'
                }}>
                  {app.status === 'scheduled' ? 'Agendado' : app.status === 'completed' ? 'Concluído' : 'Cancelado'}
                </span>
                {app.status === 'scheduled' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {type !== 'future' && (
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderColor: 'var(--success)', color: 'var(--success)' }}
                        onClick={() => setConfirmModal({ isOpen: true, action: 'complete', id: app.id })}
                      >
                        Concluir
                      </button>
                    )}
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => setConfirmModal({ isOpen: true, action: 'cancel', id: app.id })}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button 
            type="button"
            className="btn btn-outline" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </button>
          <span style={{ color: 'var(--text-secondary)' }}>Página {page} de {totalPages}</span>
          <button 
            type="button"
            className="btn btn-outline" 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Próxima
          </button>
        </div>
      )}

      {/* Modal de Confirmação */}
      {confirmModal.isOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content">
            <h3 className="mb-2">{confirmModal.action === 'complete' ? 'Concluir Agendamento' : 'Cancelar Agendamento'}</h3>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              {confirmModal.action === 'complete' ? 'Tem certeza que deseja marcar este agendamento como concluído?' : 'Tem certeza que deseja cancelar este agendamento?'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setConfirmModal({ isOpen: false, action: '', id: '' })}>Voltar</button>
              <button className={confirmModal.action === 'complete' ? 'btn btn-primary' : 'btn btn-danger'} onClick={handleConfirm}>Sim, Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
