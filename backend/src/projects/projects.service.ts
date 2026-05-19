import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  /** List all projects. If empty, seed from active employee projects */
  async findAll() {
    const dbProjects = await this.prisma.project.findMany({
      orderBy: { name: 'asc' },
    });

    if (dbProjects.length > 0) {
      return dbProjects;
    }

    // Auto-seed: if projects table is empty, collect unique project names from current employees
    const employees = await this.prisma.employee.findMany({
      select: { project: true },
    });

    const uniqueProjectNames = Array.from(
      new Set(employees.map((emp) => emp.project).filter(Boolean)),
    );

    // If still empty (e.g. fresh empty DB), add a default project
    if (uniqueProjectNames.length === 0) {
      uniqueProjectNames.push('WORKFLEX Portal');
    }

    // Save them to db so they are persistent
    for (const name of uniqueProjectNames) {
      try {
        await this.prisma.project.create({ data: { name } });
      } catch {
        // Ignore unique key constraint if simultaneous seeding occurs
      }
    }

    return this.prisma.project.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /** Create a new project */
  async create(name: string) {
    if (!name || !name.trim()) {
      throw new ConflictException('Nazwa projektu nie może być pusta');
    }

    const cleanedName = name.trim();
    const existing = await this.prisma.project.findUnique({
      where: { name: cleanedName },
    });

    if (existing) {
      throw new ConflictException('Projekt o tej nazwie już istnieje');
    }

    return this.prisma.project.create({
      data: { name: cleanedName },
    });
  }
}
