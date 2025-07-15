import React from "react";
import { 
  Scale, Brain, Globe, FileSearch, Languages, ShieldCheck, Zap, 
  Crown, Star, Check, ArrowRight, Sparkles, Users, Award, 
  MessageSquare, Download, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { useAuth } from "@/components/auth/auth-provider";
import { PricingCard } from "@/components/ui/pricing-card";
import { cn } from "@/lib/utils";
import { useLocation, Link } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const handleStartTrial = () => {
    setLocation("/chat");
  };

  const handleWatchDemo = () => {
    // Scroll to demo section
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTryDemo = () => {
    setLocation("/chat");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center neural-background overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse-slow"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-pulse-slow" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-yellow-600 rounded-full animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center pt-16">
          <div className="animate-scale-in">
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
              <span className="text-gradient">Revolutionary</span><br />
              <span className="text-foreground">AI Legal</span><br />
              <span className="text-gradient">Intelligence</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              The world's most advanced AI lawyer. Understand any law in simple language, 
              protect yourself from legal intimidation, and make confident business decisions.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
              {user ? (
                <Button onClick={() => setLocation("/chat")} size="lg" className="px-12 py-4 bg-gradient-to-r from-primary to-yellow-400 text-primary-foreground font-bold text-lg rounded-2xl hover-lift magnetic-cursor premium-glow">
                  Start Your Free Trial
                </Button>
              ) : (
                <Link href="/auth">
                  <Button size="lg" className="px-12 py-4 bg-gradient-to-r from-primary to-yellow-400 text-primary-foreground font-bold text-lg rounded-2xl hover-lift magnetic-cursor premium-glow">Start Your Free Trial</Button>
                </Link>
              )}
              
              <Button 
                onClick={handleWatchDemo}
                variant="outline" 
                size="lg"
                className="px-12 py-4 glass-morphism text-foreground font-semibold text-lg rounded-2xl hover-lift magnetic-cursor transition-all duration-300 cursor-pointer"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="text-3xl font-bold text-gradient mb-2">195+</div>
                <div className="text-muted-foreground">Countries Supported</div>
              </div>
              <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
                <div className="text-3xl font-bold text-gradient mb-2">150+</div>
                <div className="text-muted-foreground">Languages</div>
              </div>
              <div className="animate-slide-up" style={{ animationDelay: "0.6s" }}>
                <div className="text-3xl font-bold text-gradient mb-2">99.9%</div>
                <div className="text-muted-foreground">Legal Accuracy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute bottom-20 right-10 hidden lg:block animate-float">
          <div className="w-80 h-60 glass-morphism rounded-2xl p-1 premium-glow">
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-yellow-400/20 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Scale className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gradient">Legal Excellence</h3>
                <p className="text-sm text-muted-foreground">Powered by AI</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-gradient">Supreme</span> <span className="text-foreground">Features</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of legal assistance with our revolutionary AI-powered platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-32 relative" id="demo">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-up">
              <h2 className="text-5xl font-bold mb-8">
                <span className="text-foreground">See</span> <span className="text-gradient">LexAI</span> <span className="text-foreground">in Action</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Experience the power of AI-driven legal assistance. From simple legal questions to complex contract analysis, 
                LexAI provides instant, accurate, and comprehensible legal guidance.
              </p>
              
              <div className="space-y-6">
                {demoFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-6 h-6 bg-gradient-to-r from-primary to-yellow-400 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={handleTryDemo}
                size="lg"
                className="mt-8 px-8 py-4 bg-gradient-to-r from-primary to-yellow-400 text-primary-foreground font-bold text-lg rounded-2xl hover-lift magnetic-cursor premium-glow transition-all duration-300 cursor-pointer"
              >
                Try Interactive Demo
              </Button>
            </div>

            <div className="relative animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <ChatDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-gradient">Elite</span> <span className="text-foreground">Pricing</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the perfect plan for your legal intelligence needs
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <PricingCard
              title="Free Plan"
              price="$0"
              description="Perfect for getting started with AI legal assistance"
              features={[
                { text: "50 AI questions per month", included: true },
                { text: "Mistral Small AI (Free)", included: true },
                { text: "Basic legal explanations", included: true },
                { text: "Multi-language support", included: true },
                { text: "Document analysis", included: false },
                { text: "Priority support", included: false },
              ]}
              buttonText="Get Started Free"
              buttonVariant="outline"
              className="animate-slide-up"
            />

            <PricingCard
              title="LexAI Elite"
              price="$50"
              description="The ultimate legal intelligence experience"
              features={[
                { text: "150 AI questions per month", included: true },
                { text: "GPT-4o Turbo Premium AI", included: true, highlight: true },
                { text: "Advanced document analysis", included: true },
                { text: "PDF contract review", included: true },
                { text: "Priority support", included: true },
                { text: "No advertisements", included: true },
              ]}
              buttonText="Upgrade to Elite"
              buttonVariant="premium"
              popular={true}
              premium={true}
              className="animate-slide-up"
            />
          </div>

          <div className="text-center mt-16">
            <p className="text-muted-foreground mb-4">Need more questions? Purchase additional limits</p>
            <Button variant="outline" className="px-8 py-3 glass-morphism text-primary font-semibold rounded-xl hover-lift">
              $10 for 50 additional requests
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6">
              <span className="text-foreground">Trusted by</span> <span className="text-gradient">Professionals</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands who trust LexAI for their legal intelligence needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="glass-morphism rounded-3xl p-16 hover-lift animate-scale-in">
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="text-foreground">Ready to</span><br />
              <span className="text-gradient">Transform Your Legal Intelligence?</span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Join the legal revolution. Experience the power of AI-driven legal assistance 
              that eliminates fear, builds confidence, and empowers decision-making.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Button 
                size="lg"
                className="px-12 py-4 bg-gradient-to-r from-primary to-yellow-400 text-primary-foreground font-bold text-lg rounded-2xl hover-lift magnetic-cursor premium-glow"
              >
                Start Your Free Trial
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="px-12 py-4 glass-morphism text-foreground font-semibold text-lg rounded-2xl hover-lift magnetic-cursor"
              >
                Schedule a Demo
              </Button>
            </div>

            <div className="mt-12 text-muted-foreground">
              <p>No credit card required • 50 free questions • Instant access</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Feature data
const features = [
  {
    icon: Brain,
    title: "AI Legal Brain",
    description: "GPT-4o Turbo with custom legal fine-tuning, advanced reasoning chains, and contextual memory systems for unparalleled legal intelligence.",
  },
  {
    icon: Globe,
    title: "Global Intelligence",
    description: "Real-time access to laws from 195+ countries with AI-powered legal change detection and instant notifications.",
  },
  {
    icon: FileSearch,
    title: "Document Intelligence",
    description: "AI-powered analysis of PDFs, DOCs, government forms with OCR, legal entity extraction, and comprehensive risk assessment.",
  },
  {
    icon: Languages,
    title: "Multi-Language Mastery",
    description: "Native support for 150+ languages with legal terminology precision, cultural context, and regional law variations.",
  },
  {
    icon: ShieldCheck,
    title: "Military-Grade Security",
    description: "End-to-end encryption, zero-knowledge architecture, GDPR/HIPAA compliance, and SOC 2 Type II certification.",
  },
  {
    icon: Zap,
    title: "Real-Time Pipeline",
    description: "Live scraping of government websites, court databases, regulatory changes with ML-powered content analysis.",
  },
];

const demoFeatures = [
  "Instant legal explanations in simple language",
  "Protection from legal intimidation and false authority",
  "Confident business decision making",
];

const testimonials = [
  {
    rating: 5,
    text: "LexAI has revolutionized how I handle legal research. The AI's accuracy and speed are unmatched.",
    author: "Sarah Chen",
    role: "Corporate Lawyer",
    avatar: "SC",
  },
  {
    rating: 5,
    text: "Finally, a legal AI that speaks human language. LexAI makes complex law understandable for everyone.",
    author: "Michael Rodriguez",
    role: "CEO, TechStart",
    avatar: "MR",
  },
  {
    rating: 5,
    text: "The document analysis feature saved me hours of work. LexAI's insights are incredibly accurate.",
    author: "Emma Thompson",
    role: "Legal Consultant",
    avatar: "ET",
  },
];

function FeatureCard({ feature, delay }: { feature: any; delay: number }) {
  const Icon = feature.icon;
  
  return (
    <div className="gradient-border hover-lift magnetic-cursor animate-slide-up" style={{ animationDelay: `${delay}s` }}>
      <div className="gradient-border-content p-8 h-full">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-yellow-400 rounded-2xl flex items-center justify-center mb-6 premium-glow">
          <Icon className="w-8 h-8 text-primary-foreground" />
        </div>
        <h3 className="text-2xl font-bold text-gradient mb-4">{feature.title}</h3>
        <p className="text-muted-foreground leading-relaxed">
          {feature.description}
        </p>
      </div>
    </div>
  );
}

function TestimonialCard({ testimonial, delay }: { testimonial: any; delay: number }) {
  return (
    <div className="glass-morphism rounded-3xl p-8 hover-lift animate-slide-up" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-center space-x-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 text-primary fill-current" />
        ))}
      </div>
      <p className="text-muted-foreground mb-6 leading-relaxed">
        "{testimonial.text}"
      </p>
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-yellow-400 rounded-full flex items-center justify-center font-bold text-primary-foreground">
          {testimonial.avatar}
        </div>
        <div>
          <div className="font-semibold text-foreground">{testimonial.author}</div>
          <div className="text-muted-foreground text-sm">{testimonial.role}</div>
        </div>
      </div>
    </div>
  );
}

function ChatDemo() {
  return (
    <div className="glass-morphism rounded-3xl p-8">
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-foreground" />
          </div>
          <div className="bg-secondary rounded-2xl rounded-tl-none p-4 max-w-xs">
            <p className="text-foreground text-sm">The prosecutor called me about a case. What should I do?</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3 justify-end">
          <div className="bg-gradient-to-r from-primary to-yellow-400 rounded-2xl rounded-tr-none p-4 max-w-md">
            <p className="text-primary-foreground text-sm font-medium">According to criminal procedure law, you have the right to remain silent and request legal counsel. You are not obligated to speak without a lawyer present. Here's what I recommend...</p>
          </div>
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-yellow-400 rounded-full flex items-center justify-center premium-glow">
            <Scale className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 py-4">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  );
}
