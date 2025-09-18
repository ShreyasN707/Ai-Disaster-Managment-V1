import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserTable } from "@/components/admin/UserTable";
import { UserFormModal } from "@/components/admin/UserFormModal";
import { SearchBar } from "@/components/shared/SearchBar";
import { Plus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Form shape expected by UserFormModal
interface FormUser {
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'operator';
  status: 'active' | 'inactive';
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const mapBackendToForm = (u: User | null): FormUser | null => {
    if (!u) return null;
    return {
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role === 'ADMIN' ? 'admin' : 'operator',
      status: u.isActive ? 'active' : 'inactive',
    };
  };

  const mapFormToPayload = (fu: FormUser) => {
    return {
      email: fu.email,
      name: fu.name,
      role: fu.role === 'admin' ? 'ADMIN' : 'OPERATOR',
      isActive: fu.status === 'active',
    } as any;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        const response = await fetch('http://localhost:4000/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return;
          }
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data.users || []);
        setFilteredUsers(data.users || []);

      } catch (error) {
        console.error('Failed to fetch users:', error);
        // Only show toast for non-network errors or first load
        if (!(error instanceof Error) || !(`${error.message}`.includes('Failed to fetch')) || users.length === 0) {
          toast({
            title: "Users Load Issue",
            description: "Some data may be unavailable. Retrying automatically...",
            variant: "default",
          });
        }
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase()) ||
      user.role.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        setFilteredUsers(prev => prev.filter(u => u._id !== userId));
        toast({
          title: "User deleted",
          description: "User has been successfully removed.",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  const handleSaveUser = async (userData: FormUser) => {
    try {
      const token = localStorage.getItem('token');
      const payload = mapFormToPayload(userData);
      
      if (editingUser) {
        // Update existing user
        const response = await fetch(`http://localhost:4000/api/admin/users/${editingUser._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(prev => prev.map(u => u._id === editingUser._id ? data.user : u));
          setFilteredUsers(prev => prev.map(u => u._id === editingUser._id ? data.user : u));
          toast({
            title: "User updated",
            description: "User information has been successfully updated.",
          });
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update user');
        }
      } else {
        // Create new user
        const response = await fetch('http://localhost:4000/api/admin/users', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ...payload, password: 'TempPass123!' })
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(prev => [...prev, data.user]);
          setFilteredUsers(prev => [...prev, data.user]);
          toast({
            title: "User created",
            description: "New user has been successfully created.",
          });
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create user');
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to save user.",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <main className="flex-1">
          <header className="h-12 flex items-center border-b px-4">
            <SidebarTrigger />
            <h1 className="ml-4 text-lg font-semibold">User Management</h1>
          </header>

          <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Users</h2>
                <p className="text-muted-foreground">Manage system users and their roles</p>
              </div>
              <Button onClick={handleAddUser}>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? "..." : users.filter(u => u.isActive).length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Admins</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? "..." : users.filter(u => u.role === 'ADMIN').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>User List</CardTitle>
                  <SearchBar
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-80"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <UserTable
                  users={filteredUsers}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                />
              </CardContent>
            </Card>
          </div>
        </main>

        <UserFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveUser}
          user={mapBackendToForm(editingUser)}
        />
      </div>
    </SidebarProvider>
  );
}