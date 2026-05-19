import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Controller('api/employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  /** GET /api/employees — list all employees with optional filters */
  @Get()
  findAll(
    @Query('project') project?: string,
    @Query('status') status?: string,
  ) {
    return this.employeesService.findAll({ project, status });
  }

  /** GET /api/employees/summary?project=X — project cost summary */
  @Get('summary')
  getProjectSummary(@Query('project') project: string) {
    return this.employeesService.getProjectSummary(project);
  }

  /** GET /api/employees/:id — single employee */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.findOne(id);
  }

  /** POST /api/employees — create a new employee */
  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  /** PUT /api/employees/:id — update an existing employee */
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  /** DELETE /api/employees/:id — remove an employee */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.remove(id);
  }
}
