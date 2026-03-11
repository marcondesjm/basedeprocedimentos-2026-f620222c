import { WorkTimer } from "@/components/WorkTimer";
import { CompletedWorkOrders } from "@/components/CompletedWorkOrders";
import { ActivityLog } from "@/components/ActivityLog";
import { Changelog } from "@/components/Changelog";
import { WellnessReminder } from "@/components/WellnessReminder";

export const PainelView = () => (
  <section className="space-y-6" aria-label="Painel principal">
    <WellnessReminder />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <div><WorkTimer /></div>
      <div><CompletedWorkOrders /></div>
      <div><ActivityLog /></div>
      <div><Changelog /></div>
    </div>
  </section>
);
