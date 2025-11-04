import { PageHeader } from "@/components/Layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";

export const ImportTransactionsSkeleton = () => {
  return (
    <div>
      <PageHeader title="Transaktionen zuordnen" />
      <div className="flex-1 flex mt-16 gap-16">
        <div className="w-1/4 flex flex-col h-full flex-shrink-0">
          <div className="mb-4">
            <Skeleton className="h-7 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </div>

        <div className="mt-16 flex-shrink-0">
          <div className="w-[600px] h-auto p-8 border shadow-sm rounded-lg flex flex-col flex-shrink-0 flex-grow-0">
            <div className="mb-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-5 w-64" />
                </div>
                <Skeleton className="ml-6 h-7 w-16 rounded-md" />
              </div>
              <div className="flex items-baseline gap-16 pt-4">
                <div>
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div>
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>
            <div className="space-y-6 flex-1">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-auto pt-6">
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-auto pt-6">
        <Skeleton className="h-2 w-3/4 mx-auto" />
      </div>
    </div>
  );
};
