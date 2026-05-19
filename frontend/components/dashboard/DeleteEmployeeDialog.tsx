import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Employee } from '@/lib/types';

interface DeleteEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onConfirm: () => void;
  isPending: boolean;
}

export function DeleteEmployeeDialog({
  open,
  onOpenChange,
  employee,
  onConfirm,
  isPending,
}: DeleteEmployeeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" /> Usuń Pracownika?
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            Czy na pewno chcesz usunąć pracownika{' '}
            <span className="font-semibold text-foreground">
              {employee?.firstName} {employee?.lastName}
            </span>
            ? Ta akcja jest nieodwracalna i usunie dane ze wszystkich powiązanych rejestrów.
          </DialogDescription>
        </DialogHeader>

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
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
            className="text-xs h-9 px-6 font-medium cursor-pointer"
          >
            {isPending ? 'Usuwanie...' : 'Usuń pracownika'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
