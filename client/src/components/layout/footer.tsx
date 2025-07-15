import React from "react";
import { Button } from "@/components/ui/button";
import { Twitter, Linkedin, Github } from "lucide-react";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  const footerLinks = {
    features: [
      { label: "AI Legal Assistant", href: "#" },
      { label: "Document Analysis", href: "#" },
      { label: "Contract Review", href: "#" },
      { label: "Letter Generation", href: "#" },
      { label: "Multi-language Support", href: "#" },
    ],
    support: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Help Center", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "Privacy Policy", href: "#" },
    ],
  };

  return (
    <footer className={cn("bg-secondary py-12 border-t border-border", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <AnimatedLogo size="md" className="mb-4" />
            <p className="text-muted-foreground mb-4 max-w-md">
              Revolutionary AI legal assistant that eliminates fear of the law and empowers millions with accessible justice.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Github className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Features */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-muted-foreground">
              {footerLinks.features.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-muted-foreground">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2024 LexAI. All rights reserved. • Intelligence + Power + Respect for People
          </p>
        </div>
      </div>
    </footer>
  );
}
