import { useState } from 'react';
import { DummyPage } from '@/components/common/DummyPage';
import { useProjectStore, ParentProject, SubProject } from './store/projectStore';
import { ProjectTable } from './components/ProjectTable';
import { RoleSwitcher } from './components/RoleSwitcher';
import { ProjectModal } from './components/ProjectModal';
import { AllocationTable } from './components/AllocationTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function ProjectList() {
  const { currentUser } = useProjectStore();
  // Edit State
  const [editingProject, setEditingProject] = useState<ParentProject | SubProject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Permissions
  const canCreateProject = currentUser.role === 'ADMIN';

  const handleEdit = (project: ParentProject | SubProject) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <RoleSwitcher />

      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Project Management</h2>
            <p className="text-muted-foreground">
              Manage projects, track revenue, and handle employee allocations.
            </p>
          </div>
        </div>

        <Tabs defaultValue="projects" className="w-full">
          <TabsList>
            <TabsTrigger value="projects">Projects List</TabsTrigger>
            <TabsTrigger value="allocations">Resource Allocation</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="mt-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Search Bar */}
                <div className="relative w-full sm:w-[300px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search projects by name, code or client..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {canCreateProject && (
                  <Button onClick={handleCreate} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Create Project
                  </Button>
                )}
              </div>
              <ProjectTable onEdit={handleEdit} />
            </div>
          </TabsContent>

          <TabsContent value="allocations" className="mt-4">
            <AllocationTable />
          </TabsContent>
        </Tabs>
      </div>

      {
        canCreateProject && (
          <ProjectModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            projectToEdit={editingProject}
          />
        )
      }
    </div >
  );
}
