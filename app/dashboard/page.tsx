"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiClient } from "@/lib/api";
import { clearTokens } from "@/lib/auth";
import { CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Inquiry {
  inquiries_id: number;
  inquiries_name: string;
  inquiries_contact: string;
  created_at?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isChecking } = useAuthGuard({ requireAuth: true });

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // GET ONE state
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // POST states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createContact, setCreateContact] = useState("");
  const [creating, setCreating] = useState(false);

  // PUT states
  const [editingInquiry, setEditingInquiry] = useState<Inquiry | null>(null);
  const [editName, setEditName] = useState("");
  const [editContact, setEditContact] = useState("");
  const [updating, setUpdating] = useState(false);

  // 1. GET ALL
  const fetchInquiries = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiClient<Inquiry[]>(CONFIG.ENDPOINTS.INQUIRIES, {
        method: "GET",
        requiresAuth: true,
      });
      setInquiries(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isChecking) {
      fetchInquiries();
    }
  }, [isChecking]);

  // 2. GET ONE
  const handleReadOne = async (id: number) => {
    setError("");
    try {
      const data = await apiClient<Inquiry>(
        `${CONFIG.ENDPOINTS.INQUIRIES}/${id}`,
        {
          method: "GET",
          requiresAuth: true,
        }
      );
      setSelectedInquiry(data);
      setShowCreateForm(false);
      setEditingInquiry(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch inquiry details");
    }
  };

  // 3. POST
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await apiClient(CONFIG.ENDPOINTS.INQUIRIES, {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify({
          inquiries_name: createName,
          inquiries_contact: createContact,
        }),
      });
      setCreateName("");
      setCreateContact("");
      setShowCreateForm(false);
      await fetchInquiries();
    } catch (err: any) {
      setError(err.message || "Failed to create inquiry");
    } finally {
      setCreating(false);
    }
  };

  // Start PUT
  const startEditing = (inquiry: Inquiry) => {
    setEditingInquiry(inquiry);
    setEditName(inquiry.inquiries_name);
    setEditContact(inquiry.inquiries_contact);
    setShowCreateForm(false);
    setSelectedInquiry(null);
  };

  // 4. PUT
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInquiry) return;
    setUpdating(true);
    setError("");
    try {
      await apiClient(
        `${CONFIG.ENDPOINTS.INQUIRIES}/${editingInquiry.inquiries_id}`,
        {
          method: "PUT",
          requiresAuth: true,
          body: JSON.stringify({
            inquiries_name: editName,
            inquiries_contact: editContact,
          }),
        }
      );
      setEditingInquiry(null);
      await fetchInquiries();
    } catch (err: any) {
      setError(err.message || "Failed to update inquiry");
    } finally {
      setUpdating(false);
    }
  };

  // 5. DELETE
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove Client Inquiry #${id}?`
    );
    if (!confirmed) return;

    setError("");
    try {
      await apiClient(`${CONFIG.ENDPOINTS.INQUIRIES}/${id}`, {
        method: "DELETE",
        requiresAuth: true,
      });
      if (selectedInquiry?.inquiries_id === id) setSelectedInquiry(null);
      if (editingInquiry?.inquiries_id === id) setEditingInquiry(null);
      await fetchInquiries();
    } catch (err: any) {
      setError(err.message || "Failed to delete inquiry");
    }
  };

  const handleLogout = () => {
    clearTokens();
    router.push(CONFIG.ROUTES.LOGIN);
  };

  if (isChecking) return null;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241E1A]">
      {/* Studio Top Bar */}
      <header className="border-b border-[#E8DEC8] bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#A47139] font-semibold">
              Atelier &amp; Event Coordination Studio
            </p>
            <h1 className="text-2xl md:text-3xl font-serif font-semibold tracking-tight text-[#1E1814]">
              Client Inquiries &amp; Event Leads
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs px-3 py-1 rounded-full bg-[#F4ECE0] text-[#7D5324] font-medium">
              Event Planner Portal
            </span>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-[#DFD2BC] text-[#5C4630] hover:bg-[#F7F1E7]"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Event Studio KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white border-[#EAE0CE] shadow-xs">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#7A6855]">
                Active Client Inquiries
              </CardDescription>
              <CardTitle className="text-3xl font-serif text-[#1E1814]">
                {inquiries.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-[#8C7762]">
              Live records synced from /inquiries
            </CardContent>
          </Card>

          <Card className="bg-white border-[#EAE0CE] shadow-xs">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#7A6855]">
                Consultation Pipeline
              </CardDescription>
              <CardTitle className="text-3xl font-serif text-[#9E6B32]">
                {inquiries.length > 0 ? "Ready" : "Awaiting"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-[#8C7762]">
              Weddings, galas, debuts &amp; corporate events
            </CardContent>
          </Card>

          <Card className="bg-white border-[#EAE0CE] shadow-xs">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#7A6855]">
                Selected Client Brief
              </CardDescription>
              <CardTitle className="text-xl font-serif truncate text-[#1E1814]">
                {selectedInquiry ? selectedInquiry.inquiries_name : "None Selected"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-[#8C7762]">
              {selectedInquiry
                ? `Inquiry #${selectedInquiry.inquiries_id}`
                : "Click Read on any row to inspect"}
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        {/* GET ONE: Client Inquiry Details Card */}
        {selectedInquiry && (
          <Card className="bg-white border-[#DFC79F] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#F2EAE0]">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#A47139] font-semibold">
                  Client Brief Inspection
                </p>
                <CardTitle className="text-xl font-serif">
                  Inquiry #{selectedInquiry.inquiries_id} —{" "}
                  {selectedInquiry.inquiries_name}
                </CardTitle>
                <CardDescription>
                  Fetched via GET /inquiries/{selectedInquiry.inquiries_id}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedInquiry(null)}
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-[#FAF7F2]">
                <p className="text-xs text-[#7A6855]">Inquiry ID</p>
                <p className="font-semibold text-[#1E1814] mt-0.5">
                  #{selectedInquiry.inquiries_id}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#FAF7F2]">
                <p className="text-xs text-[#7A6855]">Client / Event Name</p>
                <p className="font-semibold text-[#1E1814] mt-0.5">
                  {selectedInquiry.inquiries_name}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#FAF7F2]">
                <p className="text-xs text-[#7A6855]">Contact Information</p>
                <p className="font-semibold text-[#1E1814] mt-0.5">
                  {selectedInquiry.inquiries_contact}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* POST: Create New Inquiry Form */}
        {showCreateForm && (
          <Card className="bg-white border-[#EAE0CE] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#F2EAE0]">
              <div>
                <CardTitle className="font-serif text-xl">
                  New Event Inquiry
                </CardTitle>
                <CardDescription>
                  Add a prospective client or event booking lead.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateForm(false)}
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="createName">Client / Event Inquiry Name</Label>
                    <Input
                      id="createName"
                      placeholder="e.g. Camille & Daniel Wedding"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      className="bg-[#FAF7F2] border-[#E3D6C1]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="createContact">Phone or Email</Label>
                    <Input
                      id="createContact"
                      placeholder="e.g. 0917-555-0192 or camille@email.com"
                      value={createContact}
                      onChange={(e) => setCreateContact(e.target.value)}
                      className="bg-[#FAF7F2] border-[#E3D6C1]"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating}
                    className="bg-[#9E6B32] hover:bg-[#845726] text-white"
                  >
                    {creating ? "Saving Lead..." : "Save Inquiry"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* PUT: Update Inquiry Form */}
        {editingInquiry && (
          <Card className="bg-white border-[#EAE0CE] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#F2EAE0]">
              <div>
                <CardTitle className="font-serif text-xl">
                  Update Inquiry #{editingInquiry.inquiries_id}
                </CardTitle>
                <CardDescription>
                  Update client name or contact details for this event inquiry.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingInquiry(null)}
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editName">Client / Event Inquiry Name</Label>
                    <Input
                      id="editName"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-[#FAF7F2] border-[#E3D6C1]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editContact">Phone or Email</Label>
                    <Input
                      id="editContact"
                      value={editContact}
                      onChange={(e) => setEditContact(e.target.value)}
                      className="bg-[#FAF7F2] border-[#E3D6C1]"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingInquiry(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updating}
                    className="bg-[#9E6B32] hover:bg-[#845726] text-white"
                  >
                    {updating ? "Updating..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* GET ALL: Inquiries Ledger Table */}
        <Card className="bg-white border-[#EAE0CE] shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F2EAE0]">
            <div>
              <CardTitle className="font-serif text-xl">
                Client Inquiries Ledger
              </CardTitle>
              <CardDescription>
                Manage consultations, event bookings, and client follow-ups.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={fetchInquiries}
                disabled={loading}
                className="border-[#DFD2BC] text-[#5C4630]"
              >
                {loading ? "Refreshing..." : "Read / Refresh"}
              </Button>
              <Button
                onClick={() => {
                  setShowCreateForm(true);
                  setEditingInquiry(null);
                  setSelectedInquiry(null);
                }}
                className="bg-[#9E6B32] hover:bg-[#845726] text-white"
              >
                + New Inquiry
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {loading && inquiries.length === 0 ? (
              <p className="text-sm text-[#7A6855] py-6">
                Loading client inquiries...
              </p>
            ) : inquiries.length === 0 ? (
              <p className="text-sm text-[#7A6855] py-6">
                No event inquiries yet. Click &quot;+ New Inquiry&quot; to add your
                first client lead.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#EFE6D8] text-[#7A6855]">
                      <th className="py-3 px-4 font-semibold">ID</th>
                      <th className="py-3 px-4 font-semibold">
                        Client / Event Name
                      </th>
                      <th className="py-3 px-4 font-semibold">Contact Info</th>
                      <th className="py-3 px-4 font-semibold text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map((item) => (
                      <tr
                        key={item.inquiries_id}
                        className="border-b border-[#F5EFE6] last:border-none hover:bg-[#FAF7F2] transition-colors"
                      >
                        <td className="py-3.5 px-4 font-medium text-[#7D5324]">
                          #{item.inquiries_id}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[#1E1814]">
                          {item.inquiries_name}
                        </td>
                        <td className="py-3.5 px-4 text-[#5C4C3E]">
                          {item.inquiries_contact}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReadOne(item.inquiries_id)}
                            className="border-[#DFD2BC]"
                          >
                            Read
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditing(item)}
                            className="border-[#DFD2BC]"
                          >
                            Update
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(item.inquiries_id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}