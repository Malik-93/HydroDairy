import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type SummaryCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  footerText: string;
  className?: string;
};

export function SummaryCard({ title, value, icon, footerText, className }: SummaryCardProps) {
  return (
    <Card className={cn("transition-all duration-300 hover:shadow-lg", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-4xl font-bold font-headline text-primary-foreground">{value}</div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">{footerText}</p>
      </CardFooter>
    </Card>
  );
}
