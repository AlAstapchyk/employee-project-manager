import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { fetchEmployees, fetchProjects } from '@/lib/api';
import type { Employee, Project } from '@/lib/types';

export const metadata = {
  title: 'Workflex - Panel Outsourcingu Pracowników i Kosztów',
  description: 'System zarządzania zasobami i kosztami projektowymi Workflex.',
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  let initialEmployees: Employee[] | undefined = undefined;
  let initialProjects: Project[] | undefined = undefined;

  try {
    // Pre-fetch employees and custom projects from the NestJS backend in parallel during SSR
    const [employees, projects] = await Promise.all([
      fetchEmployees(),
      fetchProjects(),
    ]);
    initialEmployees = employees;
    initialProjects = projects;
  } catch (error) {
    console.warn(
      'SSR pre-fetch warning: Could not connect to backend NestJS API. Initializing client-side fallback hydration.',
      error
    );
  }

  return (
    <DashboardClient
      initialEmployees={initialEmployees}
      initialProjects={initialProjects}
    />
  );
}
