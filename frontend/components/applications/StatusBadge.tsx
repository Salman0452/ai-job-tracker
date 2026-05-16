import { Badge } from "@/components/ui/badge";
import { ApplicationStatus } from "@/types";

const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  saved: { label: "Saved", className: "bg-gray-600 hover:bg-gray-600" },
  applied: { label: "Applied", className: "bg-blue-600 hover:bg-blue-600" },
  interview: { label: "Interview", className: "bg-yellow-600 hover:bg-yellow-600" },
  offer: { label: "Offer", className: "bg-green-600 hover:bg-green-600" },
  rejected: { label: "Rejected", className: "bg-red-600 hover:bg-red-600" },
};

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config = statusConfig[status];
  return <Badge className={config.className}>{config.label}</Badge>;
}