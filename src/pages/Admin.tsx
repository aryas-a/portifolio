import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Plus, Trash2, Upload } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  link: string;
  display_order: number;
}

interface Settings {
  id: string;
  profile_image_url: string | null;
  contact_link: string;
}

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [contactLink, setContactLink] = useState("");
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    tech: "",
    link: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (roleData?.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      fetchData();
    } catch (error: any) {
      console.error("Auth error:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    const [projectsRes, settingsRes] = await Promise.all([
      supabase.from("projects").select("*").order("display_order"),
      supabase.from("settings").select("*").single(),
    ]);

    if (projectsRes.data) setProjects(projectsRes.data);
    if (settingsRes.data) {
      setSettings(settingsRes.data);
      setContactLink(settingsRes.data.contact_link || "");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `profile-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("profile-images")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("settings")
        .update({ profile_image_url: data.publicUrl })
        .eq("id", settings!.id);

      if (updateError) throw updateError;

      toast({ title: "Success", description: "Profile image updated" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateContactLink = async () => {
    try {
      const { error } = await supabase
        .from("settings")
        .update({ contact_link: contactLink })
        .eq("id", settings!.id);

      if (error) throw error;

      toast({ title: "Success", description: "Contact link updated" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddProject = async () => {
    if (!newProject.title || !newProject.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("projects").insert({
        title: newProject.title,
        description: newProject.description,
        tech: newProject.tech.split(",").map((t) => t.trim()),
        link: newProject.link || "#",
        display_order: projects.length,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Project added" });
      setNewProject({ title: "", description: "", tech: "", link: "" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) throw error;

      toast({ title: "Success", description: "Project deleted" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Profile Image Section */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Profile Image</h2>
            <div className="flex items-center gap-4">
              {settings?.profile_image_url && (
                <img
                  src={settings.profile_image_url}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
              )}
              <div>
                <Label htmlFor="profile-image" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md">
                    <Upload className="w-4 h-4" />
                    Upload New Image
                  </div>
                </Label>
                <Input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
          </Card>

          {/* Contact Link Section */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Contact Link</h2>
            <div className="flex gap-2">
              <Input
                value={contactLink}
                onChange={(e) => setContactLink(e.target.value)}
                placeholder="https://t.me/yourusername"
              />
              <Button onClick={handleUpdateContactLink}>Update</Button>
            </div>
          </Card>

          {/* Projects Section */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Projects</h2>
            
            <div className="space-y-4 mb-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex justify-between items-start p-4 bg-card/50 rounded-lg border border-border"
                >
                  <div>
                    <h3 className="font-semibold">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {project.description}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {project.tech.map((tech, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-xl font-semibold mb-4">Add New Project</h3>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newProject.title}
                    onChange={(e) =>
                      setNewProject({ ...newProject, title: e.target.value })
                    }
                    placeholder="Project Title"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        description: e.target.value,
                      })
                    }
                    placeholder="Project Description"
                  />
                </div>
                <div>
                  <Label>Technologies (comma separated)</Label>
                  <Input
                    value={newProject.tech}
                    onChange={(e) =>
                      setNewProject({ ...newProject, tech: e.target.value })
                    }
                    placeholder="React, Node.js, MongoDB"
                  />
                </div>
                <div>
                  <Label>Link (optional)</Label>
                  <Input
                    value={newProject.link}
                    onChange={(e) =>
                      setNewProject({ ...newProject, link: e.target.value })
                    }
                    placeholder="https://example.com"
                  />
                </div>
                <Button onClick={handleAddProject}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
