import { PrismaClient, EmployeeStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SEED_EMPLOYEES = [
  {
    firstName: 'Jan',
    lastName: 'Kowalski',
    position: 'Senior Developer',
    project: 'WORKFLEX Portal',
    hourlyRate: 85,
    hoursWorked: 160,
    status: EmployeeStatus.ACTIVE,
  },
  {
    firstName: 'Anna',
    lastName: 'Nowak',
    position: 'UI/UX Designer',
    project: 'WORKFLEX Portal',
    hourlyRate: 70,
    hoursWorked: 120,
    status: EmployeeStatus.ACTIVE,
  },
  {
    firstName: 'Piotr',
    lastName: 'Wiśniewski',
    position: 'QA Engineer',
    project: 'WORKFLEX Portal',
    hourlyRate: 65,
    hoursWorked: 80,
    status: EmployeeStatus.ACTIVE,
  },
  {
    firstName: 'Katarzyna',
    lastName: 'Wójcik',
    position: 'Project Manager',
    project: 'Socap Bonus App',
    hourlyRate: 95,
    hoursWorked: 200,
    status: EmployeeStatus.ACTIVE,
  },
  {
    firstName: 'Michał',
    lastName: 'Kamiński',
    position: 'Backend Developer',
    project: 'Socap Bonus App',
    hourlyRate: 80,
    hoursWorked: 180,
    status: EmployeeStatus.ACTIVE,
  },
  {
    firstName: 'Ewa',
    lastName: 'Lewandowska',
    position: 'Frontend Developer',
    project: 'Socap Bonus App',
    hourlyRate: 75,
    hoursWorked: 140,
    status: EmployeeStatus.ON_LEAVE,
  },
  {
    firstName: 'Tomasz',
    lastName: 'Zieliński',
    position: 'DevOps Engineer',
    project: 'Internal Tools',
    hourlyRate: 90,
    hoursWorked: 100,
    status: EmployeeStatus.ACTIVE,
  },
  {
    firstName: 'Magdalena',
    lastName: 'Szymańska',
    position: 'Data Analyst',
    project: 'Internal Tools',
    hourlyRate: 72,
    hoursWorked: 60,
    status: EmployeeStatus.INACTIVE,
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.employee.deleteMany();
  await prisma.project.deleteMany();

  // Unique project names from the seeded employees
  const uniqueProjectNames = Array.from(
    new Set(SEED_EMPLOYEES.map((emp) => emp.project)),
  );

  // Insert seed projects and collect them
  const createdProjects: { id: number; name: string }[] = [];
  for (const projName of uniqueProjectNames) {
    const proj = await prisma.project.create({
      data: { name: projName },
    });
    createdProjects.push(proj);
  }

  // Insert seed data linked to projects
  for (const employee of SEED_EMPLOYEES) {
    const projectRecord = createdProjects.find(
      (p) => p.name === employee.project,
    );
    if (!projectRecord) {
      throw new Error(
        `Project ${employee.project} not found in created projects.`,
      );
    }

    // Omit loose project string and inject relational projectId
    const { project, ...employeeData } = employee;
    await prisma.employee.create({
      data: {
        ...employeeData,
        projectId: projectRecord.id,
      },
    });
  }

  console.log(
    `✅ Seeded ${SEED_EMPLOYEES.length} employees and ${uniqueProjectNames.length} projects.`,
  );
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
