import axios from 'axios';
import type {
  Employee,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  ProjectSummary,
  Project,
} from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

/** Configured axios instance pointing to the backend */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Employee API ────────────────────────────────────────────────────────────

/** Fetch all employees with optional filters */
export async function fetchEmployees(params?: {
  project?: string;
  status?: string;
}): Promise<Employee[]> {
  const { data } = await api.get<Employee[]>('/api/employees', { params });
  return data;
}

/** Fetch a single employee by ID */
export async function fetchEmployee(id: number): Promise<Employee> {
  const { data } = await api.get<Employee>(`/api/employees/${id}`);
  return data;
}

/** Create a new employee */
export async function createEmployee(
  input: CreateEmployeeInput,
): Promise<Employee> {
  const { data } = await api.post<Employee>('/api/employees', input);
  return data;
}

/** Update an existing employee */
export async function updateEmployee(
  id: number,
  input: UpdateEmployeeInput,
): Promise<Employee> {
  const { data } = await api.put<Employee>(`/api/employees/${id}`, input);
  return data;
}

/** Delete an employee */
export async function deleteEmployee(id: number): Promise<Employee> {
  const { data } = await api.delete<Employee>(`/api/employees/${id}`);
  return data;
}

/** Get project cost summary */
export async function fetchProjectSummary(
  project: string,
): Promise<ProjectSummary> {
  const { data } = await api.get<ProjectSummary>('/api/employees/summary', {
    params: { project },
  });
  return data;
}

// ─── Projects API ────────────────────────────────────────────────────────────

/** Fetch all projects */
export async function fetchProjects(): Promise<Project[]> {
  const { data } = await api.get<Project[]>('/api/projects');
  return data;
}

/** Create a new project */
export async function createProject(name: string): Promise<Project> {
  const { data } = await api.post<Project>('/api/projects', { name });
  return data;
}
