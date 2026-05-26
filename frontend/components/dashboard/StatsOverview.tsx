import { DollarSign, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface StatsOverviewProps {
  displayStats: {
    totalCost: number;
    totalHours: number;
    employeeCount: number;
  };
  selectedProjectName: string;
  isLoading?: boolean;
}

export function StatsOverview({
  displayStats,
  selectedProjectName,
  isLoading = false,
}: StatsOverviewProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* ─── TOTAL COST CARD ────────────────────────────────────────────────── */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            Sumaryczny Koszt Projektu
          </span>
          <DollarSign className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-3xl font-bold tracking-tight text-muted-foreground animate-pulse">---</div>
          ) : (
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {displayStats.totalCost.toLocaleString('pl-PL', {
                style: 'currency',
                currency: 'PLN',
                maximumFractionDigits: 0,
              })}
            </div>
          )}
          <p className="text-muted-foreground text-xs mt-1">
            {selectedProjectName === 'ALL'
              ? 'Suma stawek × przepracowane godziny (wszystkie projekty)'
              : `Wydany budżet dla projektu: ${selectedProjectName}`}
          </p>
        </CardContent>
      </Card>

      {/* ─── TOTAL HOURS CARD ───────────────────────────────────────────────── */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            Przepracowane Godziny
          </span>
          <Clock className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-3xl font-bold tracking-tight text-muted-foreground animate-pulse">---</div>
          ) : (
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {displayStats.totalHours.toLocaleString('pl-PL')}{' '}
              <span className="text-lg font-medium text-muted-foreground">h</span>
            </div>
          )}
          <p className="text-muted-foreground text-xs mt-1">
            Łączny wkład pracy zaksięgowany w systemie.
          </p>
        </CardContent>
      </Card>

      {/* ─── EMPLOYEE COUNT CARD ────────────────────────────────────────────── */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            Liczebność Zespołu
          </span>
          <Users className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-3xl font-bold tracking-tight text-muted-foreground animate-pulse">---</div>
          ) : (
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {displayStats.employeeCount}{' '}
              <span className="text-lg font-medium text-muted-foreground">osób</span>
            </div>
          )}
          <p className="text-muted-foreground text-xs mt-1">
            {selectedProjectName === 'ALL'
              ? 'Zatrudnieni specjaliści zarejestrowani w systemie.'
              : `Zatrudnieni specjaliści przypisani do projektu: ${selectedProjectName}.`}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
