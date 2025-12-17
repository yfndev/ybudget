import { PageHeader } from "@/components/Layout/PageHeader";
import { Shield } from "lucide-react";

interface Props {
  title: string;
}

export function AccessDenied({ title }: Props) {
  return (
    <div>
      <PageHeader title={title} />
      <div className="text-center py-12">
        <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Zugriff verweigert</h3>
        <p className="text-muted-foreground mt-2">
          Du benötigst Admin-Berechtigungen, um diese Seite anzuzeigen.
        </p>
      </div>
    </div>
  );
}
