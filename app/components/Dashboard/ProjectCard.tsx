import { Card } from "../ui/card";
import { Progress } from "../ui/progress";

interface ProjectCardProps {
  title: string;
  description: string;
  progress: number;
}

const ProjectCard = ({ title, description, progress }: ProjectCardProps) => {
  return (
    <Card className="w-full p-4">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">{title}</h3>
          <span className="text-sm font-medium text-muted-foreground">
            {progress}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Card>
  );
};

export default ProjectCard;
