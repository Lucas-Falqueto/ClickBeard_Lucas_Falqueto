-- CreateEnum: AppointmentStatus
CREATE TYPE "AppointmentStatus" AS ENUM ('scheduled', 'cancelled', 'completed');

-- AlterTable: converte a coluna status de TEXT para o novo enum
ALTER TABLE "Appointment"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "AppointmentStatus"
    USING "status"::"AppointmentStatus",
  ALTER COLUMN "status" SET DEFAULT 'scheduled'::"AppointmentStatus";

-- CreateIndex: índice único parcial que garante atomicidade no conflito de horários.
-- Apenas agendamentos com status = 'scheduled' entram na constraint,
-- permitindo que o mesmo (barbeiro + horário) apareça como 'cancelled' ou 'completed'.
CREATE UNIQUE INDEX "Appointment_unique_active_slot"
  ON "Appointment" ("barberId", "scheduledAt")
  WHERE status = 'scheduled';
