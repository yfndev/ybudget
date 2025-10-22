import { AppSidebar } from "../components/Sidebar/AppSidebar";
import { SidebarProvider } from "../components/ui/sidebar";
import { DateRangeProvider } from "../contexts/DateRangeContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DateRangeProvider>
      <SidebarProvider>
        <AppSidebar />
        {children}
      </SidebarProvider>
    </DateRangeProvider>
  );
}
