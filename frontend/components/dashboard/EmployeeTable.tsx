import { Edit2, Trash2, Users, Building, UserPlus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmployeeStatus } from '@/lib/types';
import type { Employee } from '@/lib/types';

interface EmployeeTableProps {
  filteredEmployees: Employee[];
  isLoadingFiltered: boolean;
  onEdit: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
  onAddClick: () => void;
}

export function EmployeeTable({
  filteredEmployees,
  isLoadingFiltered,
  onEdit,
  onDelete,
  onAddClick,
}: EmployeeTableProps) {
  if (isLoadingFiltered) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Ładowanie bazy pracowników...</p>
      </div>
    );
  }

  if (filteredEmployees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 border-dashed border-2 m-6 rounded-lg text-muted-foreground">
        <Users className="size-10 text-muted-foreground mb-2" />
        <p className="font-semibold text-foreground">Brak wyników</p>
        <p className="text-xs text-muted-foreground">
          Brak zarejestrowanych pracowników odpowiadających wybranym kryteriom filtrowania.
        </p>
        <Button
          onClick={onAddClick}
          variant="outline"
          size="sm"
          className="mt-4 cursor-pointer"
        >
          <UserPlus className="size-4 mr-2" /> Dodaj pierwszego pracownika
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Imię i Nazwisko</TableHead>
            <TableHead className="font-semibold">Stanowisko</TableHead>
            <TableHead className="font-semibold">Projekt</TableHead>
            <TableHead className="font-semibold text-right">Stawka godz.</TableHead>
            <TableHead className="font-semibold text-right">Przepracowane godz.</TableHead>
            <TableHead className="font-semibold text-right">Koszt pracownika</TableHead>
            <TableHead className="font-semibold text-center">Status</TableHead>
            <TableHead className="font-semibold text-center w-24">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmployees.map((emp) => (
            <TableRow key={emp.id} className="hover:bg-muted/40 transition-colors">
              <TableCell className="font-medium text-foreground">
                {emp.firstName} {emp.lastName}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs font-mono">
                {emp.position}
              </TableCell>
              <TableCell className="text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                  <Building className="size-3 text-muted-foreground" /> {emp.project.name}
                </span>
              </TableCell>
              <TableCell className="text-right text-muted-foreground text-xs font-mono">
                {emp.hourlyRate.toLocaleString('pl-PL', {
                  style: 'currency',
                  currency: 'PLN',
                })}/h
              </TableCell>
              <TableCell className="text-right text-muted-foreground text-xs font-mono">
                {emp.hoursWorked.toLocaleString('pl-PL')} h
              </TableCell>
              <TableCell className="text-right font-semibold text-foreground text-xs font-mono">
                {(emp.hourlyRate * emp.hoursWorked).toLocaleString('pl-PL', {
                  style: 'currency',
                  currency: 'PLN',
                })}
              </TableCell>
              <TableCell className="text-center">
                {emp.status === EmployeeStatus.ACTIVE && (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10 text-[10px] font-semibold tracking-wider"
                  >
                    Aktywny
                  </Badge>
                )}
                {emp.status === EmployeeStatus.ON_LEAVE && (
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 text-amber-500 bg-amber-500/10 text-[10px] font-semibold tracking-wider"
                  >
                    Na urlopie
                  </Badge>
                )}
                {emp.status === EmployeeStatus.INACTIVE && (
                  <Badge
                    variant="outline"
                    className="border-red-500/30 text-red-500 bg-red-500/10 text-[10px] font-semibold tracking-wider"
                  >
                    Nieaktywny
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Button
                    onClick={() => onEdit(emp)}
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Edit2 className="size-3.5" />
                  </Button>
                  <Button
                    onClick={() => onDelete(emp)}
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
