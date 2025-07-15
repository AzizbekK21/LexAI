import React, { useEffect, useRef } from "react";
import { 
  Scale, Brain, Globe, FileSearch, Languages, ShieldCheck, Zap, 
  Crown, Star, Check, ArrowRight, Sparkles, Users, Award, 
  MessageSquare, Download, Play, ChevronDown, Menu, Twitter, 
  Linkedin, Github, Upload, Clock, AlertCircle, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { PricingCard, ComparisonTable } from "@/components/ui/pricing-card";
import { cn } from "@/lib/utils";

export default function LandingComplex() {
  const heroRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Smooth scrolling for navigation links
    const handleNavClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const element = document.querySelector(target.getAttribute('href')!);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    // Add scroll effect to navigation
    const handleScroll = () => {
      if (navRef.current) {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 100) {
          navRef.current.classList.add('backdrop-blur-xl', 'bg-background/80');
        } else {
          navRef.current.classList.remove('backdrop-blur-xl', 'bg-background/80');
        }
      }
    };

    // Intersection observer for animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, observerOptions);

    // Add event listeners
    document.addEventListener('click', handleNavClick);
    window.addEventListener('scroll', handleScroll);
    
    // Observe sections
    document.querySelectorAll('section').forEach(section => {
      observer.observe(section);
    });

    return () => {
      document.removeEventListener('click', handleNavClick);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav ref={navRef} className="fixed top-0 w-full z-50 glass-morphism transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 animate-fade-in">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-yellow-400 rounded-xl flex items-center justify-center premium-glow animate-glow">
                <Scale className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-gradient">LexAI</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-foreground/80 hover:text-primary transition-colors duration-300">Features</a>
              <a href="#pricing" className="text-foreground/80 hover:text-primary transition-colors duration-300">Pricing</a>
              <a href="#demo" className="text-foreground/80 hover:text-primary transition-colors duration-300">Demo</a>
              <a href="#about" className="text-foreground/80 hover:text-primary transition-colors duration-300">About</a>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="hidden md:block text-foreground/80 hover:text-primary">
                Sign In
              </Button>
              <Button className="gradient-border magnetic-cursor bg-gradient-to-r from-primary to-yellow-400 text-primary-foreground hover:scale-105 transition-transform">
                <Crown className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center neural-background overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse-slow"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-pulse-slow" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-yellow-600 rounded-full animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-primary/60 rounded-full animate-pulse-slow" style={{ animationDelay: "3s" }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-yellow-400/60 rounded-full animate-pulse-slow" style={{ animationDelay: "4s" }}></div>
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
              <Button 
                size="lg" 
                className="group relative px-12 py-4 bg-gradient-to-r from-primary to-yellow-400 text-primary-foreground font-bold text-lg rounded-2xl hover-lift magnetic-cursor premium-glow"
              >
                <span className="relative z-10 flex items-center">
                  <Crown className="w-5 h-5 mr-2" />
                  Start Free Trial
                </span>
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="px-12 py-4 glass-morphism text-foreground font-semibold text-lg rounded-2xl hover-lift magnetic-cursor border-primary/30 hover:border-primary/60"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="animate-slide-up glass-morphism rounded-2xl p-6" style={{ animationDelay: "0.2s" }}>
                <div className="text-3xl font-bold text-gradient mb-2">195+</div>
                <div className="text-muted-foreground">Countries Supported</div>
                <div className="text-xs text-primary mt-1">Real-time legal updates</div>
              </div>
              <div className="animate-slide-up glass-morphism rounded-2xl p-6" style={{ animationDelay: "0.4s" }}>
                <div className="text-3xl font-bold text-gradient mb-2">150+</div>
                <div className="text-muted-foreground">Languages</div>
                <div className="text-xs text-primary mt-1">Native legal terminology</div>
              </div>
              <div className="animate-slide-up glass-morphism rounded-2xl p-6" style={{ animationDelay: "0.6s" }}>
                <div className="text-3xl font-bold text-gradient mb-2">99.9%</div>
                <div className="text-muted-foreground">Legal Accuracy</div>
                <div className="text-xs text-primary mt-1">GPT-4o Turbo powered</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating 3D Elements */}
        <div className="absolute bottom-20 right-10 hidden lg:block animate-float">
          <div className="w-80 h-60 glass-morphism rounded-2xl p-1 premium-glow">
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-yellow-400/20 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Scale className="w-16 h-16 text-primary mx-auto mb-4 animate-float" />
                <h3 className="text-lg font-bold text-gradient">Legal Excellence</h3>
                <p className="text-sm text-muted-foreground">Powered by AI</p>
                <div className="mt-3 flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-primary/60" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">Revolutionary Technology</Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-gradient">Supreme</span> <span className="text-foreground">Features</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of legal assistance with our revolutionary AI-powered platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advancedFeatures.map((feature, index) => (
              <AdvancedFeatureCard key={index} feature={feature} delay={index * 0.1} />
            ))}
          </div>

          {/* Feature Showcase */}
          <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-up">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">AI-Powered Analysis</Badge>
              <h3 className="text-4xl font-bold mb-6">
                <span className="text-gradient">Document Intelligence</span><br />
                <span className="text-foreground">Revolution</span>
              </h3>
              <p className="text-lg text-muted-foreground mb-8">
                Upload any legal document and get instant AI-powered analysis, risk assessment, 
                and actionable recommendations in seconds.
              </p>
              
              <div className="space-y-4">
                {documentFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-gradient-to-r from-primary to-yellow-400 rounded-full flex items-center justify-center mt-1">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <DocumentAnalysisDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo" className="py-32 relative bg-gradient-to-b from-background via-secondary/20 to-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">Interactive Experience</Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-foreground">See</span> <span className="text-gradient">LexAI</span> <span className="text-foreground">in Action</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the power of AI-driven legal assistance through our interactive demo
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-up">
              <h3 className="text-3xl font-bold mb-8">
                <span className="text-gradient">Real-time Legal Consultation</span>
              </h3>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Chat with our AI lawyer and get instant, accurate legal guidance. 
                From contract questions to criminal law, LexAI provides comprehensive answers in simple language.
              </p>
              
              <div className="space-y-6">
                {chatFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-yellow-400 rounded-xl flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                size="lg"
                className="mt-8 px-8 py-4 bg-gradient-to-r from-primary to-yellow-400 text-primary-foreground font-bold text-lg rounded-2xl hover-lift magnetic-cursor premium-glow"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Try Interactive Demo
              </Button>
            </div>

            <div className="relative animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <InteractiveChatDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Pricing Section */}
      <section id="pricing" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">Transparent Pricing</Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-gradient">Elite</span> <span className="text-foreground">Pricing</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the perfect plan for your legal intelligence needs
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            <PricingCard
              title="Free Plan"
              price="$0"
              description="Perfect for getting started with AI legal assistance"
              features={[
                { text: "50 AI questions per month", included: true },
                { text: "Mistral Small AI (Free)", included: true },
                { text: "Basic legal explanations", included: true },
                { text: "Multi-language support", included: true },
                { text: "Email support", included: true },
                { text: "Document analysis", included: false },
                { text: "Priority support", included: false },
                { text: "Advanced AI (GPT-4o)", included: false },
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
                { text: "150 AI questions per month", included: true, highlight: true },
                { text: "GPT-4o Turbo Premium AI", included: true, highlight: true },
                { text: "Advanced document analysis", included: true },
                { text: "PDF contract review", included: true },
                { text: "Real-time legal updates", included: true },
                { text: "Priority support", included: true },
                { text: "No advertisements", included: true },
                { text: "API access", included: true },
              ]}
              buttonText="Upgrade to Elite"
              buttonVariant="premium"
              popular={true}
              premium={true}
              className="animate-slide-up"
            />
          </div>

          {/* Comparison Table */}
          <div className="mb-16">
            <ComparisonTable />
          </div>

          {/* Additional Options */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-6 text-gradient">Need More?</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Button variant="outline" className="px-8 py-3 glass-morphism text-primary font-semibold rounded-xl hover-lift">
                $10 for 50 additional requests
              </Button>
              <Button variant="outline" className="px-8 py-3 glass-morphism text-primary font-semibold rounded-xl hover-lift">
                Enterprise Solutions
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Social Proof Section */}
      <section className="py-32 relative bg-gradient-to-b from-background via-secondary/10 to-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">Trusted Worldwide</Badge>
            <h2 className="text-5xl font-bold mb-6">
              <span className="text-foreground">Trusted by</span> <span className="text-gradient">Legal Professionals</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands who trust LexAI for their legal intelligence needs
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {enhancedTestimonials.map((testimonial, index) => (
              <EnhancedTestimonialCard key={index} testimonial={testimonial} delay={index * 0.1} />
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center">
            {trustIndicators.map((indicator, index) => (
              <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-3xl font-bold text-gradient mb-2">{indicator.value}</div>
                <div className="text-sm text-muted-foreground">{indicator.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 relative">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="glass-morphism rounded-3xl p-16 hover-lift animate-scale-in relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-10 left-10 w-20 h-20 border-2 border-primary rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-16 h-16 border-2 border-yellow-400 rounded-full"></div>
              <div className="absolute top-1/2 left-1/4 w-12 h-12 border border-primary/50 rounded-full"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-5xl md:text-6xl font-bold mb-8">
                <span className="text-foreground">Ready to</span><br />
                <span className="text-gradient">Transform Your Legal Intelligence?</span>
              </h2>
              
              <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                Join the legal revolution. Experience the power of AI-driven legal assistance 
                that eliminates fear, builds confidence, and empowers decision-making.
              </p>

              <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
                <Button 
                  size="lg"
                  className="px-12 py-4 bg-gradient-to-r from-primary to-yellow-400 text-primary-foreground font-bold text-lg rounded-2xl hover-lift magnetic-cursor premium-glow"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Start Your Free Trial
                </Button>
                
                <Button 
                  variant="outline"
                  size="lg"
                  className="px-12 py-4 glass-morphism text-foreground font-semibold text-lg rounded-2xl hover-lift magnetic-cursor border-primary/30"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Schedule a Demo
                </Button>
              </div>

              <div className="text-muted-foreground">
                <p className="flex items-center justify-center space-x-4 text-sm">
                  <span className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-1" />
                    No credit card required
                  </span>
                  <span className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-1" />
                    50 free questions
                  </span>
                  <span className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-1" />
                    Instant access
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="py-20 border-t border-border/50 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-yellow-400 rounded-xl flex items-center justify-center premium-glow">
                  <Scale className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold text-gradient">LexAI</span>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-md mb-6">
                Revolutionary AI legal intelligence that eliminates fear of the law and empowers millions with confident legal decision-making.
              </p>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="hover:text-primary">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:text-primary">
                  <Linkedin className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:text-primary">
                  <Github className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-foreground font-semibold mb-6">Product</h3>
              <ul className="space-y-4">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-foreground font-semibold mb-6">Company</h3>
              <ul className="space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-muted-foreground">© 2025 LexAI. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Data arrays and component definitions
const advancedFeatures = [
  {
    icon: Brain,
    title: "AI Legal Brain",
    description: "GPT-4o Turbo with custom legal fine-tuning, advanced reasoning chains, and contextual memory systems for unparalleled legal intelligence.",
    color: "from-blue-500 to-purple-600",
  },
  {
    icon: Globe,
    title: "Global Intelligence",
    description: "Real-time access to laws from 195+ countries with AI-powered legal change detection and instant notifications.",
    color: "from-green-500 to-teal-600",
  },
  {
    icon: FileSearch,
    title: "Document Intelligence",
    description: "AI-powered analysis of PDFs, DOCs, government forms with OCR, legal entity extraction, and comprehensive risk assessment.",
    color: "from-orange-500 to-red-600",
  },
  {
    icon: Languages,
    title: "Multi-Language Mastery",
    description: "Native support for 150+ languages with legal terminology precision, cultural context, and regional law variations.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: ShieldCheck,
    title: "Military-Grade Security",
    description: "End-to-end encryption, zero-knowledge architecture, GDPR/HIPAA compliance, and SOC 2 Type II certification.",
    color: "from-indigo-500 to-blue-600",
  },
  {
    icon: Zap,
    title: "Real-Time Pipeline",
    description: "Live scraping of government websites, court databases, regulatory changes with ML-powered content analysis.",
    color: "from-yellow-500 to-orange-600",
  },
];

const documentFeatures = [
  {
    title: "Instant OCR Processing",
    description: "Convert any scanned document to searchable text in seconds",
  },
  {
    title: "Risk Assessment Matrix",
    description: "Comprehensive analysis of legal risks with severity ratings",
  },
  {
    title: "Entity Extraction",
    description: "Automatically identify parties, dates, amounts, and key terms",
  },
  {
    title: "Compliance Checking",
    description: "Verify documents against current legal standards",
  },
];

const chatFeatures = [
  {
    icon: MessageSquare,
    title: "Natural Language Processing",
    description: "Ask questions in plain English, get clear legal answers",
  },
  {
    icon: ShieldCheck,
    title: "Privacy Protected",
    description: "All conversations are encrypted and confidential",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Get legal guidance anytime, anywhere",
  },
  {
    icon: Award,
    title: "Expert-Level Accuracy",
    description: "Trained on millions of legal documents and cases",
  },
];

const enhancedTestimonials = [
  {
    rating: 5,
    text: "LexAI has revolutionized how I handle legal research. The AI's accuracy and speed are unmatched. It's like having a senior associate available 24/7.",
    author: "Sarah Chen",
    role: "Senior Partner, Chen & Associates",
    avatar: "SC",
    company: "Big Law Firm",
    verified: true,
  },
  {
    rating: 5,
    text: "Finally, a legal AI that speaks human language. LexAI makes complex law understandable for everyone. Essential for any modern business.",
    author: "Michael Rodriguez",
    role: "CEO & Founder",
    avatar: "MR",
    company: "TechStart Inc.",
    verified: true,
  },
  {
    rating: 5,
    text: "The document analysis feature saved me hours of work. LexAI's insights are incredibly accurate and have helped us avoid costly mistakes.",
    author: "Emma Thompson",
    role: "Legal Consultant",
    avatar: "ET",
    company: "Thompson Legal",
    verified: true,
  },
];

const trustIndicators = [
  { value: "50K+", label: "Active Users" },
  { value: "1M+", label: "Questions Answered" },
  { value: "195", label: "Countries Served" },
  { value: "99.9%", label: "Uptime" },
];

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "API Documentation", href: "#" },
    { label: "Integrations", href: "#" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
};

function AdvancedFeatureCard({ feature, delay }: { feature: any; delay: number }) {
  const Icon = feature.icon;
  
  return (
    <div className="gradient-border hover-lift magnetic-cursor animate-slide-up group" style={{ animationDelay: `${delay}s` }}>
      <div className="gradient-border-content p-8 h-full">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-yellow-400 rounded-2xl flex items-center justify-center mb-6 premium-glow group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-8 h-8 text-primary-foreground" />
        </div>
        <h3 className="text-2xl font-bold text-gradient mb-4">{feature.title}</h3>
        <p className="text-muted-foreground leading-relaxed">
          {feature.description}
        </p>
        <div className="mt-6 pt-4 border-t border-border/30">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 p-0">
            Learn more <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function EnhancedTestimonialCard({ testimonial, delay }: { testimonial: any; delay: number }) {
  return (
    <div className="glass-morphism rounded-3xl p-8 hover-lift animate-slide-up group" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-center space-x-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 text-primary fill-current" />
        ))}
        {testimonial.verified && (
          <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )}
      </div>
      <p className="text-muted-foreground mb-6 leading-relaxed">
        "{testimonial.text}"
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-yellow-400 rounded-full flex items-center justify-center font-bold text-primary-foreground">
            {testimonial.avatar}
          </div>
          <div>
            <div className="font-semibold text-foreground">{testimonial.author}</div>
            <div className="text-muted-foreground text-sm">{testimonial.role}</div>
            <div className="text-primary text-xs">{testimonial.company}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentAnalysisDemo() {
  const [analysisProgress, setAnalysisProgress] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState(0);

  const analysisSteps = [
    { label: "Uploading document...", progress: 20 },
    { label: "OCR processing...", progress: 40 },
    { label: "Legal entity extraction...", progress: 60 },
    { label: "Risk assessment...", progress: 80 },
    { label: "Analysis complete!", progress: 100 },
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = (prev + 1) % analysisSteps.length;
        setAnalysisProgress(analysisSteps[next].progress);
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-morphism rounded-3xl p-8 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-semibold text-gradient">Document Analysis</h4>
        <Badge className="bg-primary/20 text-primary border-primary/30">
          AI Powered
        </Badge>
      </div>

      {/* Document preview */}
      <div className="bg-secondary/50 rounded-xl p-4 border-2 border-dashed border-border">
        <div className="flex items-center space-x-3 mb-3">
          <FileSearch className="w-6 h-6 text-primary" />
          <div>
            <p className="font-medium">Employment_Contract.pdf</p>
            <p className="text-sm text-muted-foreground">2.4 MB</p>
          </div>
        </div>
        <Progress value={analysisProgress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          {analysisSteps[currentStep].label}
        </p>
      </div>

      {/* Analysis results */}
      {analysisProgress === 100 && (
        <div className="space-y-4 animate-slide-up">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium text-green-400">Low Risk Document</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Standard employment terms with no significant red flags detected.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-medium text-foreground">Key Findings:</h5>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Termination clause is employee-friendly</li>
              <li>• Salary and benefits clearly defined</li>
              <li>• Non-compete period is reasonable (6 months)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function InteractiveChatDemo() {
  const [messages, setMessages] = React.useState([
    {
      role: "user",
      content: "The prosecutor called me about a case. What should I do?",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(true);
      
      const responseTimer = setTimeout(() => {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "According to criminal procedure law, you have the right to remain silent and request legal counsel. You are not obligated to speak without a lawyer present. Here's what I recommend:\n\n1. Politely decline to answer questions\n2. Request to have an attorney present\n3. Document the contact\n4. Contact a criminal defense lawyer immediately",
          timestamp: new Date(),
        }]);
        setIsTyping(false);
      }, 2000);

      return () => clearTimeout(responseTimer);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="glass-morphism rounded-3xl p-8 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-semibold text-gradient">AI Legal Chat</h4>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-400">Online</span>
        </div>
      </div>

      <div className="space-y-4 min-h-[300px]">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start space-x-3 chat-message",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-yellow-400 rounded-full flex items-center justify-center premium-glow">
                <Scale className="w-5 h-5 text-primary-foreground" />
              </div>
            )}
            
            <div className={cn(
              "max-w-[80%] rounded-2xl px-4 py-3",
              message.role === "user" 
                ? "bg-primary text-primary-foreground rounded-tr-none" 
                : "glass-morphism rounded-tl-none"
            )}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            </div>

            {message.role === "user" && (
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-foreground" />
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-start space-x-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-yellow-400 rounded-full flex items-center justify-center premium-glow">
              <Scale className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="glass-morphism rounded-2xl rounded-tl-none px-4 py-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                <span className="text-sm text-muted-foreground ml-2">AI is analyzing...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border/50 pt-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-secondary/50 rounded-xl px-4 py-3">
            <p className="text-sm text-muted-foreground">Ask any legal question...</p>
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground">
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
