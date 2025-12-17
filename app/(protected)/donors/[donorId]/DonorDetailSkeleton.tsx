import { PageHeader } from "@/components/Layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";

const BudgetCardSkeleton = () => (
  <div className="bg-card rounded-lg border p-6">
    <Skeleton className="h-4 w-20 mb-2" />
    <Skeleton className="h-8 w-32" />
  </div>
);

export default function DonorDetailSkeleton() {
  return (
    <div>
      <PageHeader
        title="Lädt..."
        subtitle=""
        showBackButton
        backUrl="/donors"
      />

      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        id="tour-donor-budget"
      >
        <BudgetCardSkeleton />
        <BudgetCardSkeleton />
        <BudgetCardSkeleton />
        <BudgetCardSkeleton />
      </div>

      <div className="mt-6" id="tour-donor-transactions">
        <div className="flex flex-row justify-between">
          <Skeleton className="h-7 w-40 mb-4" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    </div>
  );
}
