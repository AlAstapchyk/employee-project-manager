/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmployeeStatus } from '@prisma/client';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let prisma: PrismaService;

  const mockEmployeeList = [
    {
      id: 1,
      firstName: 'Jan',
      lastName: 'Kowalski',
      position: 'Developer',
      project: 'ProjectA',
      hourlyRate: 150.0,
      hoursWorked: 10.5,
      status: EmployeeStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      firstName: 'Anna',
      lastName: 'Nowak',
      position: 'QA',
      project: 'ProjectA',
      hourlyRate: 100.0,
      hoursWorked: 20.0,
      status: EmployeeStatus.ON_LEAVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockPrismaService = {
    employee: {
      findMany: jest.fn().mockResolvedValue(mockEmployeeList),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should call prisma.employee.findMany with correct parameters', async () => {
      const filters = { project: 'ProjectA', status: 'ACTIVE' };
      const result = await service.findAll(filters);

      expect(prisma.employee.findMany).toHaveBeenCalledWith({
        where: {
          project: 'ProjectA',
          status: EmployeeStatus.ACTIVE,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockEmployeeList);
    });

    it('should call prisma.employee.findMany with empty filters when none are provided', async () => {
      await service.findAll({});

      expect(prisma.employee.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return employee if found', async () => {
      const mockEmp = mockEmployeeList[0];
      jest.spyOn(prisma.employee, 'findUnique').mockResolvedValue(mockEmp);

      const result = await service.findOne(1);

      expect(prisma.employee.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockEmp);
    });

    it('should throw NotFoundException if employee not found', async () => {
      jest.spyOn(prisma.employee, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      expect(prisma.employee.findUnique).toHaveBeenCalledWith({
        where: { id: 99 },
      });
    });
  });

  describe('create', () => {
    it('should create and return employee', async () => {
      const createDto = {
        firstName: 'Tomasz',
        lastName: 'Wiśniewski',
        position: 'Designer',
        project: 'ProjectB',
        hourlyRate: 120.0,
        hoursWorked: 0,
        status: EmployeeStatus.ACTIVE,
      };

      const createdEmp = {
        id: 3,
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(prisma.employee, 'create').mockResolvedValue(createdEmp);

      const result = await service.create(createDto);

      expect(prisma.employee.create).toHaveBeenCalledWith({ data: createDto });
      expect(result).toEqual(createdEmp);
    });
  });

  describe('update', () => {
    it('should update and return employee if exists', async () => {
      const mockEmp = mockEmployeeList[0];
      const updateDto = { position: 'Lead Developer' };
      const updatedEmp = { ...mockEmp, ...updateDto };

      // Spy on findOne to bypass NotFoundException
      jest.spyOn(service, 'findOne').mockResolvedValue(mockEmp);
      jest.spyOn(prisma.employee, 'update').mockResolvedValue(updatedEmp);

      const result = await service.update(1, updateDto);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(prisma.employee.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
      expect(result).toEqual(updatedEmp);
    });
  });

  describe('remove', () => {
    it('should delete employee if exists', async () => {
      const mockEmp = mockEmployeeList[0];
      jest.spyOn(service, 'findOne').mockResolvedValue(mockEmp);
      jest.spyOn(prisma.employee, 'delete').mockResolvedValue(mockEmp);

      const result = await service.remove(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(prisma.employee.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockEmp);
    });
  });

  describe('getProjectSummary', () => {
    it('should return aggregated cost summary for a given project', async () => {
      // Sum of (hourlyRate * hoursWorked) for mockEmployeeList:
      // Jan: 150 * 10.5 = 1575
      // Anna: 100 * 20 = 2000
      // Total Cost: 1575 + 2000 = 3575
      // Total Hours: 10.5 + 20 = 30.5
      jest
        .spyOn(prisma.employee, 'findMany')
        .mockResolvedValue(mockEmployeeList);

      const result = await service.getProjectSummary('ProjectA');

      expect(prisma.employee.findMany).toHaveBeenCalledWith({
        where: { project: 'ProjectA' },
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

      expect(result).toEqual({
        project: 'ProjectA',
        employeeCount: 2,
        totalHours: 30.5,
        totalCost: 3575.0,
        employees: [
          {
            id: 1,
            name: 'Jan Kowalski',
            position: 'Developer',
            hourlyRate: 150.0,
            hoursWorked: 10.5,
            cost: 1575.0,
          },
          {
            id: 2,
            name: 'Anna Nowak',
            position: 'QA',
            hourlyRate: 100.0,
            hoursWorked: 20.0,
            cost: 2000.0,
          },
        ],
      });
    });

    it('should return empty summary if no employees are on the project', async () => {
      jest.spyOn(prisma.employee, 'findMany').mockResolvedValue([]);

      const result = await service.getProjectSummary('NonExistentProject');

      expect(result).toEqual({
        project: 'NonExistentProject',
        employeeCount: 0,
        totalHours: 0,
        totalCost: 0,
        employees: [],
      });
    });
  });
});
