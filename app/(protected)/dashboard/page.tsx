"use client";
import BudgetCard from "@/components/Dashboard/BudgetCard";
import { BudgetChart } from "@/components/Dashboard/BudgetChart";
import { CategoryChart } from "@/components/Dashboard/CategoryChart";
import ProjectCard from "@/components/Dashboard/ProjectCard";
import { PageHeader } from "@/components/Layout/PageHeader";
import { SidebarInset } from "@/components/ui/sidebar";
import { useDateRange } from "@/contexts/DateRangeContext";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const { selectedDateRange } = useDateRange();

  const startDate = selectedDateRange.from.getTime();
  const endDate = selectedDateRange.to.getTime();

  const projects = useQuery(api.queries.projectQueries.getProjects);
  const availableBudget = useQuery(
    api.queries.getAvailableBudget.getAvailableBudget,
    { startDate, endDate }
  );
  const allocatedBudget = useQuery(
    api.queries.getAllocatedBudget.getAllocatedBudget,
    { startDate, endDate }
  );
  const spentBudget = useQuery(api.queries.getSpentBudget.getSpentBudget, {
    startDate,
    endDate,
  });
  const receivedBudget = useQuery(
    api.queries.getReceivedBudget.getReceivedBudget,
    { startDate, endDate }
  );

  return (
    <SidebarInset>
      <div className="px-4 lg:px-6 pb-6 overflow-x-hidden w-full">
        <PageHeader title="Dashboard" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <BudgetCard
            title={"Offenes Budget"}
            amount={availableBudget ?? 0}
            description="Geplante Einnahmen + erhaltene Einnahmen - Ausgaben"
          />
          <BudgetCard
            title={"Verplant"}
            amount={allocatedBudget ?? 0}
            description="Summe aller erwarteten Transaktionen"
          />
          <BudgetCard
            title={"Ausgegeben"}
            amount={spentBudget ?? 0}
            description="Summe aller Ausgaben des Bankkontos"
          />
          <BudgetCard
            title={"Eingenommen"}
            amount={receivedBudget ?? 0}
            description="Summe aller Einnahmen des Bankkontos"
          />
        </div>
        <div className="flex flex-col lg:flex-row h-auto lg:h-[400px] w-full gap-4 lg:gap-6 mt-4 lg:mt-6">
          <BudgetChart />
          <CategoryChart />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full gap-4 lg:gap-6 mt-4 lg:mt-6">
          {projects?.map((project) => (
            <ProjectCard
              key={project._id}
              title={project.name}
              description={project.description}
              // progress={project.progress}
              progress={20}
              projectId={project._id}
            />
          ))}
        </div>
      </div>
    </SidebarInset>
  );
}
