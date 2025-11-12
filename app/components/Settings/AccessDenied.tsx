import { Shield } from "lucide-react";
import { PageHeader } from "@/components/Layout/PageHeader";

export function AccessDenied({ title }: { title: string }) {
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

