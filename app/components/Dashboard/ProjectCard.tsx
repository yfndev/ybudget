"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

interface ProjectCardProps {
  title: string;
  description?: string;
  progress: number;
  projectId?: string;
}

export default function ProjectCard({
  title,
  description,
  progress,
  projectId,
}: ProjectCardProps) {
  const cardClass = projectId
    ? "w-full h-auto min-h-32 px-6 py-4 cursor-pointer hover:border-primary transition-colors"
    : "w-full h-auto min-h-32 px-6 py-4";

  return (
    <Card className={cardClass}>
      <Link href={`/projects/${projectId}`}>
        <div className="flex flex-col gap-3 h-full">
          <div className="flex justify-between items-start gap-3">
            <h3 className="text-xl font-semibold break-words flex-1">
              {title}
            </h3>
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              {progress.toFixed(1)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 break-words">
              {description}
            </p>
          )}
        </div>
      </Link>
    </Card>
  );
}
