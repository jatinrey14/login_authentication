"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { logoutUser } from "@/lib/auth";
import { ShieldCheck, LogOut } from "lucide-react";

export default function DashboardPage() {
  useAuthGuard();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Protected Dashboard</h1>
          <p className="text-muted-foreground mt-1">Authenticated via NestJS Backend API.</p>
        </div>
        <Button variant="destructive" onClick={logoutUser} className="gap-2">
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Session Security Verified
          </CardTitle>
          <CardDescription>JWT token active in local storage</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>You have successfully connected your Next.js frontend to your custom NestJS backend.</p>
        </CardContent>
      </Card>
    </div>
  );
}