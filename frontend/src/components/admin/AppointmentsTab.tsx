import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AppointmentsTabProps {
  today: any[];
  future: any[];
}

export default function AppointmentsTab({ today, future }: AppointmentsTabProps) {
  const renderAppointments = (appointmentsList: any[]) => {
    if (appointmentsList.length === 0) return <p style={{ color: 'var(--text-secondary)' }}>Nenhum agendamento encontrado.</p>;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {appointmentsList.map(app => (
          <div key={app.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{format(new Date(app.scheduledAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                <strong>Cliente:</strong> {app.user.name} | <strong>Serviço:</strong> {app.specialty.name} | <strong>Barbeiro:</strong> {app.barber.name}
              </p>
            </div>
            <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.875rem',
              fontWeight: 600,
              background: app.status === 'scheduled' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: app.status === 'scheduled' ? 'var(--accent-primary)' : 'var(--danger)'
            }}>
              {app.status === 'scheduled' ? 'Agendado' : 'Cancelado'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '3rem' }}>
        <h3 className="mb-2">Agendamentos de Hoje</h3>
        {renderAppointments(today)}
      </div>
      <div>
        <h3 className="mb-2">Agendamentos Futuros</h3>
        {renderAppointments(future)}
      </div>
    </div>
  );
}
