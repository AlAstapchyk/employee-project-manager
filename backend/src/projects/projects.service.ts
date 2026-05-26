import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  /** List all projects */
  async findAll() {
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
