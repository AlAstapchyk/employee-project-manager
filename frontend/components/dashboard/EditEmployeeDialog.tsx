import { useState } from 'react';
import toast from 'react-hot-toast';
import { Edit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmployeeStatus } from '@/lib/types';
import type { Employee, CreateEmployeeInput } from '@/lib/types';

interface EditEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  projectList: string[];
  onSubmit: (inputs: CreateEmployeeInput) => void;
  isPending: boolean;
}

export function EditEmployeeDialog({
  open,
  onOpenChange,
  employee,
  projectList,
  onSubmit,
  isPending,
}: EditEmployeeDialogProps) {
  const [formInputs, setFormInputs] = useState<CreateEmployeeInput>({
    firstName: employee.firstName,
    lastName: employee.lastName,
    position: employee.position,
    project: employee.project,
    hourlyRate: employee.hourlyRate,
    hoursWorked: employee.hoursWorked,
    status: employee.status,
  });

  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    position?: string;
    project?: string;
    hourlyRate?: string;
    hoursWorked?: string;
  }>({});

  const handleInputChange = (
    field: keyof CreateEmployeeInput,
    value: CreateEmployeeInput[keyof CreateEmployeeInput],
  ) => {
    setFormInputs((prev) => ({ ...prev, [field]: value }));
    const errorKey = field as keyof typeof errors;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!formInputs.firstName.trim()) newErrors.firstName = 'Imię jest wymagane';
    if (!formInputs.lastName.trim()) newErrors.lastName = 'Nazwisko jest wymagane';
    if (!formInputs.position.trim()) newErrors.position = 'Stanowisko jest wymagane';
    if (!formInputs.project.trim()) newErrors.project = 'Projekt jest wymagany';
    if (formInputs.hourlyRate <= 0) newErrors.hourlyRate = 'Stawka musi być większa od 0';
    if ((formInputs.hoursWorked ?? 0) < 0) newErrors.hoursWorked = 'Godziny nie mogą być ujemne';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Proszę poprawić wyróżnione pola w formularzu.');
      return;
    }

    onSubmit(formInputs);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Edit2 className="size-5" /> Edytuj Dane Pracownika
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            Modyfikuj dane osobowe, projekt lub status wybranego pracownika.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          <div className="grid grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-firstName" className={`text-xs font-semibold ${errors.firstName ? 'text-destructive' : ''}`}>
                Imię
              </Label>
              <Input
                id="edit-firstName"
                value={formInputs.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`bg-background h-9 text-xs transition-colors ${
                  errors.firstName ? 'border-destructive ring-destructive ring-1 focus-visible:ring-destructive' : ''
                }`}
              />
              {errors.firstName && (
                <span className="text-[10px] text-destructive font-medium block mt-0.5 animate-fade-in">
                  {errors.firstName}
                </span>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-lastName" className={`text-xs font-semibold ${errors.lastName ? 'text-destructive' : ''}`}>
                Nazwisko
              </Label>
              <Input
                id="edit-lastName"
                value={formInputs.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`bg-background h-9 text-xs transition-colors ${
                  errors.lastName ? 'border-destructive ring-destructive ring-1 focus-visible:ring-destructive' : ''
                }`}
              />
              {errors.lastName && (
                <span className="text-[10px] text-destructive font-medium block mt-0.5 animate-fade-in">
                  {errors.lastName}
                </span>
              )}
            </div>
          </div>

          {/* Position */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-position" className={`text-xs font-semibold ${errors.position ? 'text-destructive' : ''}`}>
              Stanowisko
            </Label>
            <Input
              id="edit-position"
              value={formInputs.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              className={`bg-background h-9 text-xs transition-colors ${
                errors.position ? 'border-destructive ring-destructive ring-1 focus-visible:ring-destructive' : ''
              }`}
            />
            {errors.position && (
              <span className="text-[10px] text-destructive font-medium block mt-0.5 animate-fade-in">
                {errors.position}
              </span>
            )}
          </div>

          {/* Project Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-project" className={`text-xs font-semibold ${errors.project ? 'text-destructive' : ''}`}>
              Projekt
            </Label>
            <Select
              value={formInputs.project}
              onValueChange={(val) => handleInputChange('project', val ?? '')}
            >
              <SelectTrigger
                id="edit-project"
                className={`w-full bg-background text-xs h-9! cursor-pointer transition-colors ${
                  errors.project ? 'border-destructive ring-destructive ring-1 focus:ring-destructive' : ''
                }`}
              >
                <SelectValue placeholder="Wybierz projekt">
                  {formInputs.project || 'Wybierz projekt'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {projectList.length === 0 ? (
                  <SelectItem value="" disabled>Brak projektów. Dodaj nowy!</SelectItem>
                ) : (
                  projectList.map((proj) => (
                    <SelectItem key={proj} value={proj} className="cursor-pointer">
                      {proj}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.project && (
              <span className="text-[10px] text-destructive font-medium block mt-0.5 animate-fade-in">
                {errors.project}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Hourly Rate */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-hourlyRate" className={`text-xs font-semibold ${errors.hourlyRate ? 'text-destructive' : ''}`}>
                Stawka godzinowa (PLN)
              </Label>
              <Input
                id="edit-hourlyRate"
                type="number"
                value={formInputs.hourlyRate || ''}
                onChange={(e) => handleInputChange('hourlyRate', parseFloat(e.target.value) || 0)}
                className={`bg-background h-9 text-xs transition-colors ${
                  errors.hourlyRate ? 'border-destructive ring-destructive ring-1 focus-visible:ring-destructive' : ''
                }`}
              />
              {errors.hourlyRate && (
                <span className="text-[10px] text-destructive font-medium block mt-0.5 animate-fade-in">
                  {errors.hourlyRate}
                </span>
              )}
            </div>

            {/* Hours Worked */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-hoursWorked" className={`text-xs font-semibold ${errors.hoursWorked ? 'text-destructive' : ''}`}>
                Przepracowane godziny
              </Label>
              <Input
                id="edit-hoursWorked"
                type="number"
                value={formInputs.hoursWorked || ''}
                onChange={(e) => handleInputChange('hoursWorked', parseFloat(e.target.value) || 0)}
                className={`bg-background h-9 text-xs transition-colors ${
                  errors.hoursWorked ? 'border-destructive ring-destructive ring-1 focus-visible:ring-destructive' : ''
                }`}
              />
              {errors.hoursWorked && (
                <span className="text-[10px] text-destructive font-medium block mt-0.5 animate-fade-in">
                  {errors.hoursWorked}
                </span>
              )}
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-status" className="text-xs font-semibold">Status</Label>
            <Select
              value={formInputs.status}
              onValueChange={(val) => handleInputChange('status', val ?? EmployeeStatus.ACTIVE)}
            >
              <SelectTrigger className="w-full bg-background text-xs h-9! cursor-pointer">
                <SelectValue>
                  {formInputs.status === EmployeeStatus.ACTIVE
                    ? 'Aktywny'
                    : formInputs.status === EmployeeStatus.ON_LEAVE
                    ? 'Na urlopie'
                    : 'Nieaktywny'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EmployeeStatus.ACTIVE} className="cursor-pointer">Aktywny</SelectItem>
                <SelectItem value={EmployeeStatus.ON_LEAVE} className="cursor-pointer">Na urlopie</SelectItem>
                <SelectItem value={EmployeeStatus.INACTIVE} className="cursor-pointer">Nieaktywny</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9 cursor-pointer"
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="text-xs h-9 px-6 font-medium cursor-pointer"
            >
              {isPending ? 'Zapisywanie...' : 'Zaktualizuj dane'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
