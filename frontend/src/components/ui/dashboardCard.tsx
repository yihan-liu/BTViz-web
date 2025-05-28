import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import {accent, AccentKey} from "@/lib/dashboard-accent"

interface Props {
  title: string;
  value: ReactNode;
  delta?: number | null; 
  icon?: LucideIcon;
  variant: AccentKey;
  className?: string;
}

export default function DashboardCard({
  title,
  value, 
  delta,
  icon: Icon,
  variant,
  className,
}: Props) {
  const tone = accent[variant];

  return (
    <Card
      className={cn(
              
        /* surface */
        "relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-sm",
        /* soft outline tinted by variant */
        "ring-1",  
        tone.ring,
        /* elevation */
        "shadow-[0_12px_24px_-10px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.18)] transition-shadow",
        className,
      )}
    >
      <CardHeader className="flex items-start gap-4 px-6 pt-6 pb-3">
        {Icon && (
          <span
            className={cn(
              "border border-border/60",
              "grid place-items-center rounded-lg p-2.5",
              tone.badge,
            )}
          >
            <Icon className={cn("h-5 w-5", tone.icon)} />
          </span>
        )}

        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>

     <CardContent className="flex flex-col items-center justify-center pb-6 pt-0 gap-1">
        <span className="text-4xl font-semibold leading-none"> {value}</span>
      </CardContent>
    </Card>
  );
}
