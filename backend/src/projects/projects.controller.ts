import { Controller, Get, Post, Body } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('api/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll() {
    return this.projectsService.findAll();
  }

  @Post()
  async create(@Body('name') name: string) {
    return this.projectsService.create(name);
  }
}
