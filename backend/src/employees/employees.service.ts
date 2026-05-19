import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Prisma, EmployeeStatus } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  /** List employees with optional project / status filters */
  async findAll(filters: { project?: string; status?: string }) {
    const where: Prisma.EmployeeWhereInput = {};

    if (filters.project) {
      where.project = filters.project;
    }

    if (filters.status) {
      where.status = filters.status as EmployeeStatus;
    }

    return this.prisma.employee.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Get a single employee by ID */
  async findOne(id: number) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  /** Create a new employee */
  async create(dto: CreateEmployeeDto) {
    return this.prisma.employee.create({ data: dto });
  }

  /** Update an existing employee */
  async update(id: number, dto: UpdateEmployeeDto) {
    await this.findOne(id); // throws NotFoundException if not found
    return this.prisma.employee.update({ where: { id }, data: dto });
  }

  /** Delete an employee */
  async remove(id: number) {
    await this.findOne(id); // throws NotFoundException if not found
    return this.prisma.employee.delete({ where: { id } });
  }

  /**
   * GET /api/employees/summary?project=X
   * Returns total project cost = Σ (hourlyRate × hoursWorked) for all employees on the project
   */
  async getProjectSummary(project: string) {
    const employees = await this.prisma.employee.findMany({
      where: { project },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        position: true,
        hourlyRate: true,
        hoursWorked: true,
        status: true,
      },
    });

    const totalCost = employees.reduce(
      (sum, emp) => sum + emp.hourlyRate * emp.hoursWorked,
      0,
    );

    const totalHours = employees.reduce((sum, emp) => sum + emp.hoursWorked, 0);

    return {
      project,
      employeeCount: employees.length,
      totalHours: Math.round(totalHours * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      employees: employees.map((emp) => ({
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        position: emp.position,
        hourlyRate: emp.hourlyRate,
        hoursWorked: emp.hoursWorked,
        cost: Math.round(emp.hourlyRate * emp.hoursWorked * 100) / 100,
      })),
    };
  }
}
