'use client'
import Link from "next/link";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface AccountCardProps {
  account: {
    id: string;
    name: string;
    type: string;
    createdAt: string;
    balance: string;
    isDefault: boolean;
  };
}

export function AccountCard({ account }: AccountCardProps) {
  return (
    <Link href={`/account/${account.id}`} className="block group">
      <Card className="flex flex-col gap-1 shadow-sm hover:shadow-lg transition-shadow bg-white/90 dark:bg-zinc-900/80 min-w-[220px] max-w-xs cursor-pointer group-hover:ring-2 group-hover:ring-primary/30">
        <CardHeader className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base truncate">{account.name}</span>
            {account.isDefault && (
              <Badge variant="secondary" className="flex flex-col items-end ml-2 px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-800">
                Default
              </Badge>
            )}
          </div>
          <Badge
            variant="outline"
            className={
              (account.type === "CURRENT"
                ? "bg-purple-100 text-purple-700"
                : "bg-yellow-100 text-yellow-700") +
              " capitalize px-2 py-0.5 text-xs font-medium"
            }
          >
            {account.type}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-green-700">{account.balance}</span>
          </div>
          <div className="text-xs text-muted-foreground mb-1">
            Created {account.createdAt}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4 text-green-500" />
            <span>Income</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowDownRight className="w-4 h-4 text-red-500" />
            <span>Expense</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}