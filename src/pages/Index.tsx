import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import profileImage from "@/assets/profile.jpg";
import { Code2, ExternalLink, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  link: string;
  display_order: number;
  image_url?: string;
}

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [profileImageUrl, setProfileImageUrl] = useState(profileImage);
  const [contactLink, setContactLink] = useState("https://t.me/yourusername");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [projectsRes, settingsRes] = await Promise.all([
      supabase.from("projects").select("*").order("display_order"),
      supabase.from("settings").select("*").single(),
    ]);

    if (projectsRes.data) {
      setProjects(projectsRes.data);
    }

    if (settingsRes.data) {
      if (settingsRes.data.profile_image_url) {
        setProfileImageUrl(settingsRes.data.profile_image_url);
      }
      if (settingsRes.data.contact_link) {
        setContactLink(settingsRes.data.contact_link);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card" />
        
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Profile Image */}
            <div className="flex justify-center animate-slide-in-left">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-500" />
                <img
                  src={profileImageUrl}
                  alt="Arya's Profile"
                  className="relative w-64 h-64 md:w-80 md:h-80 object-cover rounded-full border-4 border-card shadow-2xl"
                />
              </div>
            </div>

            {/* Right side - Content */}
            <div className="text-center md:text-left space-y-6 animate-slide-in-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary animate-scale-in">
                <Code2 className="w-4 h-4" />
                <span>Full Stack Developer</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                aryas-dev
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground italic leading-relaxed">
                "Code is poetry written in logic. Every line tells a story, every function solves a problem."
              </p>
              
              <div className="flex gap-4 justify-center md:justify-start pt-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-accent hover:shadow-glow transition-all duration-300"
                  onClick={() => window.location.href = "#projects"}
                >
                  View Projects
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-primary/50 hover:bg-primary/10"
                  onClick={() => window.open(contactLink, "_blank")}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Contact Me
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Featured <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Projects</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Building innovative solutions that make a difference
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {project.image_url && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <img 
                      src={project.image_url} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                  </div>
                )}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-2xl font-semibold group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.tech.map((tech, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 text-sm bg-primary/10 text-primary border border-primary/20 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Hover gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-20 text-center animate-fade-in">
            <Card className="p-8 md:p-12 bg-gradient-to-br from-card via-card to-primary/5 border-primary/20">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Let's Build Something <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Amazing</span>
              </h3>
              <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
                Have a project in mind? I'm always open to discussing new opportunities and creative collaborations.
              </p>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:shadow-glow transition-all duration-300 text-lg px-8"
                onClick={() => window.open(contactLink, "_blank")}
              >
                <Send className="w-5 h-5 mr-2" />
                Contact Me on Telegram
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="container mx-auto max-w-6xl text-center text-muted-foreground">
          <p>© 2025 aryas-dev. Crafted with passion and code.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
