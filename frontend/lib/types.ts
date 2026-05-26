/** Employee status options */
export enum EmployeeStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ON_LEAVE = "ON_LEAVE",
}

/** Employee entity returned from the API */
export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  projectId: number;
  project: Project;
  hourlyRate: number;
  hoursWorked: number;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt: string;
}

/** DTO for creating a new employee */
export interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  position: string;
  projectId: number;
  hourlyRate: number;
  hoursWorked?: number;
  status?: EmployeeStatus;
}

/** DTO for updating an employee (all fields optional) */
export type UpdateEmployeeInput = Partial<CreateEmployeeInput>;

/** Project summary returned from GET /api/employees/summary?project=X */
export interface ProjectSummary {
  project: string;
  employeeCount: number;
  totalHours: number;
  totalCost: number;
  employees: {
    id: number;
    name: string;
    position: string;
    hourlyRate: number;
    hoursWorked: number;
    cost: number;
  }[];
}

/** Project entity returned from the API */
export interface Project {
  id: number;
  name: string;
  createdAt: string;
}
