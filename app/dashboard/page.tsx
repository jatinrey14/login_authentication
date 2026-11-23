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

  // Data & UI states
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // GET (Single Read) state
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // POST (Create) states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createContact, setCreateContact] = useState("");
  const [creating, setCreating] = useState(false);

  // PUT (Update) states
  const [editingInquiry, setEditingInquiry] = useState<Inquiry | null>(null);
  const [editName, setEditName] = useState("");
  const [editContact, setEditContact] = useState("");
  const [updating, setUpdating] = useState(false);

  // 1. GET ALL: Fetch all inquiries
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

  // 2. GET ONE: Fetch single inquiry by ID
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

  // 3. POST: Create a new inquiry
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

  // Open Update Form
  const startEditing = (inquiry: Inquiry) => {
    setEditingInquiry(inquiry);
    setEditName(inquiry.inquiries_name);
    setEditContact(inquiry.inquiries_contact);
    setShowCreateForm(false);
    setSelectedInquiry(null);
  };

  // 4. PUT: Update an existing inquiry
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

  // 5. DELETE: Remove an inquiry
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete Inquiry #${id}?`
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
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage client inquiries
          </p>
        </div>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      {/* GET ONE: Details Card */}
      {selectedInquiry && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                Inquiry Details (#{selectedInquiry.inquiries_id})
              </CardTitle>
              <CardDescription>
                Fetched directly from GET /inquiries/{selectedInquiry.inquiries_id}
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
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Inquiry ID</p>
              <p className="font-medium">{selectedInquiry.inquiries_id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{selectedInquiry.inquiries_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Contact</p>
              <p className="font-medium">{selectedInquiry.inquiries_contact}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* POST: Create Form Card */}
      {showCreateForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Create New Inquiry</CardTitle>
              <CardDescription>
                Fill in the details to add a new inquiry.
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
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="createName">Inquiry Name</Label>
                  <Input
                    id="createName"
                    placeholder="e.g. Juan Dela Cruz"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="createContact">Contact Details</Label>
                  <Input
                    id="createContact"
                    placeholder="e.g. 09123456789 or juan@email.com"
                    value={createContact}
                    onChange={(e) => setCreateContact(e.target.value)}
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
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create Inquiry"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* PUT: Update Form Card */}
      {editingInquiry && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                Update Inquiry #{editingInquiry.inquiries_id}
              </CardTitle>
              <CardDescription>
                Modify the inquiry name and contact below.
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
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editName">Inquiry Name</Label>
                  <Input
                    id="editName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editContact">Contact Details</Label>
                  <Input
                    id="editContact"
                    value={editContact}
                    onChange={(e) => setEditContact(e.target.value)}
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
                <Button type="submit" disabled={updating}>
                  {updating ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* GET ALL: Inquiries Table Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Inquiries</CardTitle>
            <CardDescription>
              A list of all inquiries stored in the backend.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchInquiries}
              disabled={loading}
            >
              {loading ? "Loading..." : "Read / Refresh"}
            </Button>
            <Button
              onClick={() => {
                setShowCreateForm(true);
                setEditingInquiry(null);
                setSelectedInquiry(null);
              }}
            >
              + Create Inquiry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && inquiries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              Loading inquiries...
            </p>
          ) : inquiries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No inquiries found. Click &quot;+ Create Inquiry&quot; to add one.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="py-3 px-4 font-medium">ID</th>
                    <th className="py-3 px-4 font-medium">Name</th>
                    <th className="py-3 px-4 font-medium">Contact</th>
                    <th className="py-3 px-4 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((item) => (
                    <tr
                      key={item.inquiries_id}
                      className="border-b last:border-none hover:bg-muted/50"
                    >
                      <td className="py-3 px-4">{item.inquiries_id}</td>
                      <td className="py-3 px-4 font-medium">
                        {item.inquiries_name}
                      </td>
                      <td className="py-3 px-4">{item.inquiries_contact}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReadOne(item.inquiries_id)}
                        >
                          Read
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditing(item)}
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
    </div>
  );
}