import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsEnum,
  IsOptional,
  Min,
} from 'class-validator';

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
}

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @IsString()
  @IsNotEmpty({ message: 'Position is required' })
  position: string;

  @IsString()
  @IsNotEmpty({ message: 'Project name is required' })
  project: string;

  @IsNumber({}, { message: 'Hourly rate must be a number' })
  @IsPositive({ message: 'Hourly rate must be positive' })
  hourlyRate: number;

  @IsOptional()
  @IsNumber({}, { message: 'Hours worked must be a number' })
  @Min(0, { message: 'Hours worked cannot be negative' })
  hoursWorked?: number;

  @IsOptional()
  @IsEnum(EmployeeStatus, {
    message: 'Status must be one of: ACTIVE, INACTIVE, ON_LEAVE',
  })
  status?: EmployeeStatus;
}
