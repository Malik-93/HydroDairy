import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button";
import { Receipt } from "lucide-react";

type SummaryCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  footerText: string;
  className?: string;
  onAddPayment?: () => void;
};

export function SummaryCard({ title, value, icon, footerText, className, onAddPayment }: SummaryCardProps) {
  return (
    <Card className={cn("transition-all duration-300 hover:shadow-lg flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-4xl font-bold font-headline text-primary-foreground">{value}</div>
      </CardContent>
      <CardFooter className="flex justify-between items-center mt-auto">
        <p className="text-xs text-muted-foreground">{footerText}</p>
        {onAddPayment && (
            <Button variant="ghost" size="sm" className="text-xs h-auto px-2 py-1" onClick={onAddPayment}>
                <Receipt className="h-3 w-3 mr-1"/>
                Add Payment
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
