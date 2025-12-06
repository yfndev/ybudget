import { PageHeader } from "@/components/Layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";

export const ImportTransactionsSkeleton = () => {
  return (
    <div id="tour-import-page">
      <PageHeader title="Transaktionen zuordnen" />
      <div className="flex mt-8 justify-center" id="tour-import-progress">
        <Skeleton className="w-3/4 h-2" />
      </div>
      <div className="flex flex-col items-center mt-12 gap-8">
        <div id="tour-import-card" className="w-full max-w-xl">
          <div className="w-full p-8 border shadow-sm rounded-lg flex flex-col">
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
    </div>
  );
};
