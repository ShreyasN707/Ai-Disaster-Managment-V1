import { useState } from "react";
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
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator';
  status: 'active' | 'inactive';
  lastLogin: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Admin',
    email: 'john@admin.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2 hours ago'
  },
  {
    id: '2',
    name: 'Sarah Operator',
    email: 'sarah@operator.com',
    role: 'operator',
    status: 'active',
    lastLogin: '1 day ago'
  },
  {
    id: '3',
    name: 'Mike Field',
    email: 'mike@field.com',
    role: 'operator',
    status: 'inactive',
    lastLogin: '1 week ago'
  }
];

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

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

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setFilteredUsers(prev => prev.filter(u => u.id !== userId));
    toast({
      title: "User deleted",
      description: "User has been successfully removed.",
    });
  };

  const handleSaveUser = (userData: User) => {
    if (editingUser) {
      // Update existing user
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...userData, id: editingUser.id } : u));
      setFilteredUsers(prev => prev.map(u => u.id === editingUser.id ? { ...userData, id: editingUser.id } : u));
      toast({
        title: "User updated",
        description: "User information has been successfully updated.",
      });
    } else {
      // Add new user
      const newUser = { ...userData, id: Date.now().toString(), lastLogin: 'Never' };
      setUsers(prev => [...prev, newUser]);
      setFilteredUsers(prev => [...prev, newUser]);
      toast({
        title: "User created",
        description: "New user has been successfully created.",
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
                    {users.filter(u => u.status === 'active').length}
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
                    {users.filter(u => u.role === 'admin').length}
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
          user={editingUser}
        />
      </div>
    </SidebarProvider>
  );
}