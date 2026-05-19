import { useState } from 'react';
import toast from 'react-hot-toast';
import { Building } from 'lucide-react';
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

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (projectName: string) => void;
  isPending: boolean;
}

export function AddProjectDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: AddProjectDialogProps) {
  const [newProjectName, setNewProjectName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (value: string) => {
    setNewProjectName(value);
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      setError('Nazwa projektu jest wymagana');
      toast.error('Proszę poprawić wyróżnione pola w formularzu.');
      return;
    }
    onSubmit(newProjectName.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Building className="size-5" /> Dodaj Nowy Projekt
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            Wpisz unikalną nazwę nowego projektu Workflex. Będzie ona dostępna do wyboru przy dodawaniu i edycji pracowników.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="projectName"
              className={`text-xs font-semibold ${error ? 'text-destructive' : ''}`}
            >
              Nazwa projektu
            </Label>
            <Input
              id="projectName"
              placeholder="np. Nowa Aplikacja Mobilna"
              value={newProjectName}
              onChange={(e) => handleInputChange(e.target.value)}
              className={`bg-background h-9 text-xs transition-colors ${
                error ? 'border-destructive ring-destructive ring-1 focus-visible:ring-destructive' : ''
              }`}
            />
            {error && (
              <span className="text-[10px] text-destructive font-medium block mt-0.5 animate-fade-in">
                {error}
              </span>
            )}
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
              {isPending ? 'Zapisywanie...' : 'Zapisz projekt'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
