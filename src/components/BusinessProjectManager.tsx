import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface BusinessProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
}

interface BusinessProjectManagerProps {
  onProjectSelect: (projectId: string | null) => void;
  selectedProjectId: string | null;
}

const BusinessProjectManager = ({ onProjectSelect, selectedProjectId }: BusinessProjectManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<BusinessProject[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('business_projects')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
      
      // Auto-select first project if none selected
      if (data && data.length > 0 && !selectedProjectId) {
        onProjectSelect(data[0].id);
      }
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      });
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      toast({
        title: 'Error',
        description: 'Project name is required',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('business_projects')
        .insert([
          {
            user_id: user?.id,
            name: newProject.name,
            description: newProject.description,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setProjects([data, ...projects]);
      onProjectSelect(data.id);
      setNewProject({ name: '', description: '' });
      setIsDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Your Projects
            </CardTitle>
            <CardDescription>Manage your business projects</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Set up a new business project to manage your store and campaigns
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    placeholder="My E-commerce Store"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  />
                </div>
                <Button
                  onClick={handleCreateProject}
                  disabled={isCreating}
                  className="w-full"
                >
                  {isCreating ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No projects yet. Create your first project to get started.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedProjectId === project.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onProjectSelect(project.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  {project.description && (
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BusinessProjectManager;
