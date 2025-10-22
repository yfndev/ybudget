"use client";

import BudgetCard from "@/components/Dashboard/BudgetCard";
import { CategoryChart } from "@/components/Dashboard/CategoryChart";
import ProjectCard from "@/components/Dashboard/ProjectCard";
import { PageHeader } from "@/components/Layout/PageHeader";
import { DataTable } from "@/components/Tables/DataTable";
import { columns } from "@/components/Tables/columns";
import { mockProjects } from "@/components/data/mockProjects";
import { mockTransactions } from "@/components/data/mockTransactions";
import { SidebarInset } from "@/components/ui/sidebar";
import { useParams } from "next/navigation";

export default function ProjectDetail() {
  const params = useParams();
  const projectId = params.projectId as string;

  const project = mockProjects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <SidebarInset>
        <div className="p-6">
          <p>Projekt nicht gefunden</p>
        </div>
      </SidebarInset>
    );
  }

  const children = mockProjects.filter((p) => p.parentId === projectId);
  const projectTransactions = mockTransactions.filter(
    (t) => t.project === project.name
  );

  return (
    <SidebarInset>
      <div className="px-4 lg:px-6 pb-6 overflow-x-hidden w-full">
        <PageHeader title={project.name} />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <BudgetCard
            title="Offenes Budget"
            amount={4019}
            changePercent={2.4}
          />
          <BudgetCard title="Verplant" amount={14920} changePercent={9.2} />
          <BudgetCard title="Ausgegeben" amount={3900} changePercent={-8.9} />
          <BudgetCard title="Eingenommen" amount={250} changePercent={-15.2} />
        </div>

        {children.length > 0 && (
          <div className="flex flex-col lg:flex-row h-auto lg:h-[400px] w-full gap-4 lg:gap-6 mt-4 lg:mt-6">
            <div className="flex-1 flex flex-col">
              <h2 className="text-xl font-semibold mb-4">Projekte</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 flex-1">
                {children.map((child) => (
                  <ProjectCard
                    key={child.id}
                    title={child.name}
                    description={child.description}
                    progress={child.progress}
                    projectId={child.id}
                  />
                ))}
              </div>
            </div>
            <CategoryChart />
          </div>
        )}

        <div className="mt-4 lg:mt-6">
          <h2 className="text-xl font-semibold mb-4">Transaktionen</h2>
          <DataTable columns={columns} data={projectTransactions} />
        </div>
      </div>
    </SidebarInset>
  );
}
