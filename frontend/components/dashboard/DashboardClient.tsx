'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Plus,
  Filter,
  Search,
  RefreshCw,
  X,
} from 'lucide-react';

import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  fetchProjectSummary,
  fetchProjects,
  createProject,
} from '@/lib/api';
import { EmployeeStatus } from '@/lib/types';
import type { Employee, CreateEmployeeInput, Project } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import newly extracted modular sub-components
import { StatsOverview } from './StatsOverview';
import { EmployeeTable } from './EmployeeTable';
import { AddEmployeeDialog } from './AddEmployeeDialog';
import { EditEmployeeDialog } from './EditEmployeeDialog';
import { DeleteEmployeeDialog } from './DeleteEmployeeDialog';
import { AddProjectDialog } from './AddProjectDialog';

interface DashboardClientProps {
  initialEmployees?: Employee[];
  initialProjects?: Project[];
}

export function DashboardClient({
  initialEmployees,
  initialProjects,
}: DashboardClientProps) {
  const queryClient = useQueryClient();

  // ─── Filters & Search State ────────────────────────────────────────────────
  const [selectedProject, setSelectedProject] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ─── CRUD Modal States ─────────────────────────────────────────────────────
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // ─── Project Dialog State ──────────────────────────────────────────────────
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);

  // ─── Fetch Queries ─────────────────────────────────────────────────────────
  // Fetch ALL employees first to extract dynamic project names
  const { data: allEmployees = [], isLoading: isLoadingAll } = useQuery<Employee[]>({
    queryKey: ['employees', 'all'],
    queryFn: () => fetchEmployees(),
    initialData: initialEmployees,
  });

  // Fetch all custom projects from database
  const { data: dbProjects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    initialData: initialProjects,
  });

  // Merge database projects and active employee projects dynamically
  const projectList = Array.from(
    new Set([
      ...dbProjects.map((p) => p.name),
      ...allEmployees.map((emp) => emp.project).filter(Boolean),
    ])
  ).sort();

  // Fetch filtered list for display
  const { data: employees = [], isLoading: isLoadingFiltered } = useQuery<Employee[]>({
    queryKey: ['employees', 'filtered', selectedProject, selectedStatus],
    queryFn: () =>
      fetchEmployees({
        project: selectedProject === 'ALL' ? undefined : selectedProject,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
      }),
    initialData:
      selectedProject === 'ALL' && selectedStatus === 'ALL'
        ? initialEmployees
        : undefined,
  });

  // Fetch project cost summary from backend REST endpoint if specific project is selected
  const { data: projectSummary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['projectSummary', selectedProject],
    queryFn: () => fetchProjectSummary(selectedProject),
    enabled: selectedProject !== 'ALL',
  });

  const isStatsLoading =
    selectedProject === 'ALL'
      ? isLoadingAll
      : (isLoadingAll || isLoadingSummary);

  // ─── CRUD Mutations ────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      toast.success('Pracownik został pomyślnie dodany!');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsAddOpen(false);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string | string[] } } };
      const errMsg = err.response?.data?.message || 'Nie udało się dodać pracownika.';
      toast.error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; input: CreateEmployeeInput }) =>
      updateEmployee(data.id, data.input),
    onSuccess: () => {
      toast.success('Dane pracownika zostały zaktualizowane!');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsEditOpen(false);
      setSelectedEmployee(null);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string | string[] } } };
      const errMsg = err.response?.data?.message || 'Nie udało się zaktualizować danych.';
      toast.error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      toast.success('Pracownik został usunięty.');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsDeleteOpen(false);
      setSelectedEmployee(null);
    },
    onError: () => {
      toast.error('Wystąpił błąd podczas usuwania pracownika.');
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      toast.success('Projekt został pomyślnie dodany!');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsAddProjectOpen(false);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const errMsg = err.response?.data?.message || 'Nie udało się dodać projektu.';
      toast.error(errMsg);
    },
  });

  const handleCreateEmployee = (inputs: CreateEmployeeInput) => {
    createMutation.mutate(inputs);
  };

  const handleUpdateEmployee = (inputs: CreateEmployeeInput) => {
    if (selectedEmployee) {
      updateMutation.mutate({ id: selectedEmployee.id, input: inputs });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedEmployee) {
      deleteMutation.mutate(selectedEmployee.id);
    }
  };

  const handleCreateProject = (projectName: string) => {
    createProjectMutation.mutate(projectName);
  };

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['employees'] });
    await queryClient.invalidateQueries({ queryKey: ['projectSummary'] });
    await queryClient.invalidateQueries({ queryKey: ['projects'] });
    toast.success('Dane zostały odświeżone');
  };

  const handleOpenEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsDeleteOpen(true);
  };

  // ─── Dynamic Stats Calculation (For Global Summary or Selected Project) ────
  const displayStats = selectedProject !== 'ALL' && projectSummary
    ? {
        totalCost: projectSummary.totalCost,
        totalHours: projectSummary.totalHours,
        employeeCount: projectSummary.employeeCount,
      }
    : {
        totalCost: allEmployees.reduce((sum, emp) => sum + emp.hourlyRate * emp.hoursWorked, 0),
        totalHours: allEmployees.reduce((sum, emp) => sum + emp.hoursWorked, 0),
        employeeCount: allEmployees.length,
      };

  // Search Filter (applied on top of query results for immediate keystroke filter)
  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const pos = emp.position.toLowerCase();
    const proj = emp.project.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || pos.includes(query) || proj.includes(query);
  });

  return (
    <div className="flex-1 min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in duration-300">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md border border-neutral-200 px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase bg-neutral-100 text-neutral-900 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-100">
                Workflex
              </span>
              <span className="text-xs text-muted-foreground font-medium tracking-widest uppercase">
                System Zarządzania
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-2 text-foreground">
              Pracownicy i Koszty Projektów
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Panel kontrolny outsourcingu kadrowego oraz monitorowania budżetu w czasie rzeczywistym.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground h-9 w-9 flex items-center justify-center rounded-lg cursor-pointer"
              title="Odśwież wszystkie dane"
            >
              <RefreshCw className="size-4" />
            </Button>
            <Button
              onClick={() => setIsAddProjectOpen(true)}
              variant="outline"
              className="gap-2 h-9 rounded-lg text-xs cursor-pointer"
            >
              <Plus className="size-4" /> Nowy Projekt
            </Button>
            <Button
              onClick={() => setIsAddOpen(true)}
              className="gap-2 h-9 rounded-lg text-xs cursor-pointer"
            >
              <Plus className="size-4" /> Dodaj Pracownika
            </Button>
          </div>
        </header>

        {/* Aggregated KPI Cards Section */}
        <StatsOverview
          displayStats={displayStats}
          selectedProject={selectedProject}
          isLoading={isStatsLoading}
        />

        {/* Filter and Table Card */}
        <Card className="border">
          <CardHeader className="pb-4 border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <Filter className="size-4" /> Baza Pracowników
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Zarządzaj zespołem, weryfikuj stawki i czas pracy w ramach projektów.
                </p>
              </div>

              {/* Dynamic Filter Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="relative min-w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Szukaj pracownika..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-xs bg-background"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>

                {/* Project Filter */}
                <Select value={selectedProject} onValueChange={(val) => setSelectedProject(val ?? 'ALL')}>
                  <SelectTrigger className="w-44 text-xs bg-background !h-9 cursor-pointer">
                    <SelectValue>
                      {selectedProject === 'ALL' ? 'Wszystkie projekty' : selectedProject}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL" className="cursor-pointer">Wszystkie projekty</SelectItem>
                    {projectList.map((proj) => (
                      <SelectItem key={proj} value={proj} className="cursor-pointer">
                        {proj}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val ?? 'ALL')}>
                  <SelectTrigger className="w-36 text-xs bg-background !h-9 cursor-pointer">
                    <SelectValue>
                      {selectedStatus === 'ALL'
                        ? 'Wszyscy statusy'
                        : selectedStatus === EmployeeStatus.ACTIVE
                        ? 'Aktywny'
                        : selectedStatus === EmployeeStatus.ON_LEAVE
                        ? 'Na urlopie'
                        : 'Nieaktywny'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL" className="cursor-pointer">Wszyscy statusy</SelectItem>
                    <SelectItem value={EmployeeStatus.ACTIVE} className="cursor-pointer">Aktywny</SelectItem>
                    <SelectItem value={EmployeeStatus.ON_LEAVE} className="cursor-pointer">Na urlopie</SelectItem>
                    <SelectItem value={EmployeeStatus.INACTIVE} className="cursor-pointer">Nieaktywny</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <EmployeeTable
              filteredEmployees={filteredEmployees}
              isLoadingFiltered={isLoadingFiltered}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onAddClick={() => setIsAddOpen(true)}
            />
          </CardContent>
        </Card>
      </div>

      {/* ─── MODULAR DIALOGS ─────────────────────────────────────────────────── */}
      {isAddOpen && (
        <AddEmployeeDialog
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          projectList={projectList}
          onSubmit={handleCreateEmployee}
          isPending={createMutation.isPending}
        />
      )}

      {isEditOpen && selectedEmployee && (
        <EditEmployeeDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          employee={selectedEmployee}
          projectList={projectList}
          onSubmit={handleUpdateEmployee}
          isPending={updateMutation.isPending}
        />
      )}

      <DeleteEmployeeDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        employee={selectedEmployee}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />

      {isAddProjectOpen && (
        <AddProjectDialog
          open={isAddProjectOpen}
          onOpenChange={setIsAddProjectOpen}
          onSubmit={handleCreateProject}
          isPending={createProjectMutation.isPending}
        />
      )}
    </div>
  );
}
