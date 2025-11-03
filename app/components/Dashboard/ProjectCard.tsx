"use client";

import Link from "next/link";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";

interface ProjectCardProps {
  title: string;
  description: string;
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
    ? "w-full h-auto max-h-40 p-4 cursor-pointer hover:border-primary transition-colors"
    : "w-full h-auto max-h-40 p-4";

  return (
    <Card className={cardClass}>
      <Link href={`/projects/${projectId}`}>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">{title}</h3>
            <span className="text-sm font-medium text-muted-foreground">
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground line-clamp-3">
            {description}
          </p>
        </div>
      </Link>
    </Card>
  );
}
