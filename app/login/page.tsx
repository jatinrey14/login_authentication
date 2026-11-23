"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import { CONFIG } from "@/lib/config";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  access_token?: string;
  refresh_token?: string;
  token?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { isChecking } = useAuthGuard({ requireAuth: false });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiClient<LoginResponse>(CONFIG.ENDPOINTS.LOGIN, {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      const accessToken =
        data.accessToken || data.access_token || data.token || "";
      const refreshToken = data.refreshToken || data.refresh_token || "";

      setTokens(accessToken, refreshToken);
      router.push(CONFIG.ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err.message || "Unable to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) return null;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241E1A] flex flex-col">
      {/* Studio Top Bar */}
      <header className="border-b border-[#E8DEC8] bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#A47139] font-semibold">
              Atelier &amp; Event Coordination Studio
            </p>
            <p className="text-lg font-serif font-semibold text-[#1E1814]">
              Event Planner Portal
            </p>
          </div>
          <Link
            href={CONFIG.ROUTES.REGISTER}
            className="text-xs px-3.5 py-1.5 rounded-full bg-[#F4ECE0] text-[#7D5324] font-medium hover:bg-[#EADBC5] transition-colors"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Centered Sign-In Card */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-1.5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#A47139] font-semibold">
              Coordinator Access
            </p>
            <h1 className="text-3xl font-serif font-semibold tracking-tight text-[#1E1814]">
              Welcome Back
            </h1>
            <p className="text-sm text-[#7A6855]">
              Sign in to manage client inquiries, consultations, and events.
            </p>
          </div>

          <Card className="bg-white border-[#EAE0CE] shadow-sm">
            <CardHeader className="border-b border-[#F2EAE0] pb-4">
              <CardTitle className="font-serif text-xl text-[#1E1814]">
                Sign In
              </CardTitle>
              <CardDescription className="text-[#7A6855]">
                Enter your account username and password.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="pt-5 space-y-4">
                {error && (
                  <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-[#241E1A]">
                    Username / Email
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="e.g. planner@atelier.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-[#FAF7F2] border-[#E3D6C1] focus-visible:ring-[#9E6B32]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#241E1A]">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#FAF7F2] border-[#E3D6C1] focus-visible:ring-[#9E6B32]"
                    required
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#9E6B32] hover:bg-[#845726] text-white"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </Button>

                <p className="text-xs text-center text-[#7A6855]">
                  New to the studio?{" "}
                  <Link
                    href={CONFIG.ROUTES.REGISTER}
                    className="font-semibold text-[#9E6B32] hover:underline"
                  >
                    Register an account
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}