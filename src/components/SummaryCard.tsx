import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button";
import { Receipt } from "lucide-react";

type SummaryCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bill: number;
  totalBill: number;
  className?: string;
  onSettleBill?: () => void;
};

export function SummaryCard({ title, value, icon, bill, totalBill, className, onSettleBill }: SummaryCardProps) {
  return (
    <Card className={cn("transition-all duration-300 hover:shadow-lg flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-4xl font-bold font-headline text-primary-foreground">{value}</div>
        <p className="text-xs text-muted-foreground pt-1">
          Bill (this period): <span className="font-bold">{bill.toFixed(2)} PKR</span>
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center mt-auto">
        <p className="text-xs text-muted-foreground">
            Total Dues: <span className="font-bold">{totalBill.toFixed(2)} PKR</span>
        </p>
        {onSettleBill && (
            <Button variant="ghost" size="sm" className="text-xs h-auto px-2 py-1" onClick={onSettleBill} disabled={bill <= 0}>
                <Receipt className="h-3 w-3 mr-1"/>
                Settle Bill
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
