"use client";
import BudgetCard from "@/components/Dashboard/BudgetCard";
import { BudgetChart } from "@/components/Dashboard/BudgetChart";
import { CategoryChart } from "@/components/Dashboard/CategoryChart";
import ProjectCard from "@/components/Dashboard/ProjectCard";
import { PageHeader } from "@/components/Layout/PageHeader";
import { mockProjects } from "@/components/data/mockProjects";
import { SidebarInset } from "@/components/ui/sidebar";

export default function Dashboard() {
  return (
    <SidebarInset>
      <div className="px-4 lg:px-6 pb-6 overflow-x-hidden w-full">
        <PageHeader title="Dashboard" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <BudgetCard
            title={"Offenes Budget"}
            amount={4019}
            changePercent={2.4}
          />
          <BudgetCard title={"Verplant"} amount={14920} changePercent={9.2} />
          <BudgetCard title={"Ausgegeben"} amount={3900} changePercent={-8.9} />
          <BudgetCard
            title={"Eingenommen"}
            amount={250}
            changePercent={-15.2}
          />
        </div>
        <div className="flex flex-col lg:flex-row h-auto lg:h-[400px] w-full gap-4 lg:gap-6 mt-4 lg:mt-6">
          <BudgetChart />
          <CategoryChart />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full gap-4 lg:gap-6 mt-4 lg:mt-6">
          {mockProjects.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.name}
              description={project.description}
              progress={project.progress}
              projectId={project.id}
            />
          ))}
        </div>
      </div>
    </SidebarInset>
  );
}
