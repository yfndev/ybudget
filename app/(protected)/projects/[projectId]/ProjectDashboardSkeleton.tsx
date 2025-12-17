import { PageHeader } from "@/components/Layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";

const BudgetCardSkeleton = () => (
  <div className="rounded-lg border p-6">
    <Skeleton className="h-4 w-24 mb-3" />
    <Skeleton className="h-8 w-32 mb-3" />
    <Skeleton className="h-3 w-48" />
  </div>
);

export function ProjectDashboardSkeleton() {
  return (
    <div>
      <PageHeader title="" showBackButton />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <BudgetCardSkeleton />
        <BudgetCardSkeleton />
        <BudgetCardSkeleton />
        <BudgetCardSkeleton />
      </div>

      <div className="mt-4 lg:mt-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>
    </div>
  );
}
