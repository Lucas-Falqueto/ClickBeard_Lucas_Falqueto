import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@clickbeard.com' },
    update: { role: 'ADMIN' },
    create: {
      name: 'Admin',
      email: 'admin@clickbeard.com',
      password: adminPassword,
      role: 'ADMIN'
    },
  });

  const specCorte = await prisma.specialty.upsert({
    where: { name: 'Corte' },
    update: {},
    create: { name: 'Corte', description: 'Corte na tesoura ou máquina' }
  });

  const specBarba = await prisma.specialty.upsert({
    where: { name: 'Barba' },
    update: {},
    create: { name: 'Barba', description: 'Barba completa' }
  });

  // check if there are barbers already
  const barberCount = await prisma.barber.count();
  if (barberCount === 0) {
    await prisma.barber.create({
      data: {
        name: 'João Barbeiro',
        age: 30,
        hiringDate: new Date('2023-01-01'),
        specialties: {
          create: [
            { specialty: { connect: { id: specCorte.id } } },
            { specialty: { connect: { id: specBarba.id } } }
          ]
        }
      }
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
