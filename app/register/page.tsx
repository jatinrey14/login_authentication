"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
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

export default function RegisterPage() {
  const router = useRouter();
  const { isChecking } = useAuthGuard({ requireAuth: false });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await apiClient(CONFIG.ENDPOINTS.REGISTER, {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      setSuccess("Account created! Redirecting you to sign in...");
      setTimeout(() => {
        router.push(CONFIG.ROUTES.LOGIN);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
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
            href={CONFIG.ROUTES.LOGIN}
            className="text-xs px-3.5 py-1.5 rounded-full bg-[#F4ECE0] text-[#7D5324] font-medium hover:bg-[#EADBC5] transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </header>

      {/* Centered Registration Card */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-1.5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#A47139] font-semibold">
              New Team Member
            </p>
            <h1 className="text-3xl font-serif font-semibold tracking-tight text-[#1E1814]">
              Join the Studio
            </h1>
            <p className="text-sm text-[#7A6855]">
              Create an account to access the client inquiries workspace.
            </p>
          </div>

          <Card className="bg-white border-[#EAE0CE] shadow-sm">
            <CardHeader className="border-b border-[#F2EAE0] pb-4">
              <CardTitle className="font-serif text-xl text-[#1E1814]">
                Create Account
              </CardTitle>
              <CardDescription className="text-[#7A6855]">
                Register your credentials to get started.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="pt-5 space-y-4">
                {error && (
                  <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm font-medium">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-medium">
                    {success}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="regUsername" className="text-[#241E1A]">
                    Username / Email
                  </Label>
                  <Input
                    id="regUsername"
                    type="text"
                    placeholder="e.g. planner@atelier.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-[#FAF7F2] border-[#E3D6C1] focus-visible:ring-[#9E6B32]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regPassword" className="text-[#241E1A]">
                    Password
                  </Label>
                  <Input
                    id="regPassword"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#FAF7F2] border-[#E3D6C1] focus-visible:ring-[#9E6B32]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#241E1A]">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>

                <p className="text-xs text-center text-[#7A6855]">
                  Already have an account?{" "}
                  <Link
                    href={CONFIG.ROUTES.LOGIN}
                    className="font-semibold text-[#9E6B32] hover:underline"
                  >
                    Sign in here
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