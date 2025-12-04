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

// Treat image_url as a general media URL (image/video or YouTube/Vimeo)
const isYouTubeUrl = (url: string) => /(?:youtube\.com\/watch\?v=|youtu\.be\/)/i.test(url);
const isVimeoUrl = (url: string) => /(?:vimeo\.com\/)/i.test(url);
const getYouTubeEmbedUrl = (url: string) => {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return `https://www.youtube.com/embed/${id}`;
    }
    const id = u.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : url;
  } catch {
    return url;
  }
};
const getVimeoEmbedUrl = (url: string) => {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : url;
};
const isVideoFileUrl = (url: string) => /(\.mp4|\.webm|\.ogg)(\?.*)?$/i.test(url);

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
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-card/50" />

        {/* Enhanced animated background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 via-accent-secondary/5 to-accent/5 rounded-full blur-3xl animate-pulse-glow" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left side - Profile Image */}
            <div className="flex justify-center animate-slide-in-left">
              <div className="relative group">
                {/* Animated gradient border with shimmer effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent-secondary to-accent rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-all duration-500 animate-gradient-shift" style={{ backgroundSize: "200% 200%" }} />
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-full opacity-50" />
                <img
                  src={profileImageUrl}
                  alt="Arya's Profile"
                  className="relative w-72 h-72 md:w-96 md:h-96 object-cover rounded-full border-4 border-card shadow-2xl"
                />
              </div>
            </div>

            {/* Right side - Content */}
            <div className="text-center md:text-left space-y-7 animate-slide-in-right">
              {/* Refined badge */}
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-full text-sm font-medium text-primary animate-scale-in backdrop-blur-sm">
                <Code2 className="w-4 h-4" />
                <span className="tracking-wide">Full Stack Developer</span>
              </div>

              {/* Enhanced typography */}
              <h1 className="text-6xl md:text-8xl font-extrabold leading-tight">
                <span className="bg-gradient-to-r from-primary via-accent-secondary to-accent bg-clip-text text-transparent" style={{ backgroundSize: "200% auto" }}>
                  aryas-dev
                </span>
              </h1>

              {/* Better quote styling */}
              <div className="relative">
                <div className="absolute -left-4 top-0 text-6xl text-primary/20 font-serif">"</div>
                <p className="text-xl md:text-2xl text-muted-foreground/90 leading-relaxed pl-8 pr-4 font-light">
                  Code is poetry written in logic. Every line tells a story, every function solves a problem.
                </p>
              </div>

              {/* Enhanced CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-center md:justify-start pt-6 w-full max-w-md mx-auto md:mx-0">
                <Button
                  size="lg"
                  className="group w-full sm:w-auto bg-gradient-to-r from-primary via-accent-secondary to-accent hover:shadow-glow-warm transition-all duration-300 text-base font-semibold px-8 py-6 hover:scale-105"
                  onClick={() => window.location.href = "#projects"}
                >
                  <span>View Projects</span>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="group w-full sm:w-auto border-2 border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300 text-base font-semibold px-8 py-6"
                  onClick={() => window.open(contactLink, "_blank")}
                >
                  <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                  <span>Contact Me</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-24 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20 animate-slide-up">
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6">
              Featured <span className="text-gradient-warm">Projects</span>
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Building innovative solutions that make a difference
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden bg-card/60 backdrop-blur-md border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-card-hover animate-scale-in hover:scale-[1.02]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                {project.image_url && (
                  <div className="relative h-48 w-full overflow-hidden">
                    {isYouTubeUrl(project.image_url) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(project.image_url)}
                        title={project.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : isVimeoUrl(project.image_url) ? (
                      <iframe
                        src={getVimeoEmbedUrl(project.image_url)}
                        title={project.title}
                        className="w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    ) : isVideoFileUrl(project.image_url) ? (
                      <video
                        className="w-full h-full object-cover"
                        src={project.image_url}
                        controls
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                  </div>
                )}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-2xl font-semibold group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    {project.link && project.link !== "#" && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${project.title}`}
                        className="shrink-0"
                      >
                        <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                      </a>
                    )}
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
          <div className="mt-24 text-center animate-slide-up">
            <Card className="relative overflow-hidden p-10 md:p-16 bg-gradient-to-br from-card/80 via-primary/5 to-accent/5 border-primary/30 backdrop-blur-sm">
              {/* Decorative orbs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <h3 className="text-4xl md:text-5xl font-extrabold mb-6">
                  Let's Build Something <span className="text-gradient-warm">Amazing</span>
                </h3>
                <p className="text-muted-foreground/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                  Have a project in mind? I'm always open to discussing new opportunities and creative collaborations.
                </p>
                <div className="max-w-sm mx-auto">
                  <Button
                    size="lg"
                    className="group w-full sm:w-auto bg-gradient-to-r from-primary via-accent-secondary to-accent hover:shadow-glow-warm transition-all duration-300 text-lg font-semibold px-10 py-7 hover:scale-105"
                    onClick={() => window.open(contactLink, "_blank")}
                  >
                    <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 group-hover:rotate-12 transition-transform" />
                    <span>Contact Me on Telegram</span>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-muted-foreground/80 text-sm md:text-base">
            © 2025 <span className="text-foreground font-medium">aryas-dev</span>. Crafted with passion and code.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
