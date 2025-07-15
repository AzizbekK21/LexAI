import React from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Check, ArrowRight, Shield, Zap, Globe } from "lucide-react";

export default function LandingBackup() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      {/* Simplified Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <AnimatedLogo size="xl" className="mb-8" />
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-gradient">AI Legal Assistant</span><br />
            <span className="text-foreground">for Everyone</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get instant legal guidance, understand complex laws in simple terms, 
            and make confident decisions with our advanced AI lawyer.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-primary text-primary-foreground">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>

          {/* Simple stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">195+</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">150+</div>
              <div className="text-sm text-muted-foreground">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Features */}
      <section className="py-20 bg-secondary/20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose <span className="text-primary">LexAI</span>?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Secure & Private</h3>
                <p className="text-muted-foreground">
                  Military-grade encryption protects all your legal consultations.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Instant Answers</h3>
                <p className="text-muted-foreground">
                  Get immediate responses to your legal questions 24/7.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Global Coverage</h3>
                <p className="text-muted-foreground">
                  Access legal information from 195+ countries worldwide.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Simple Pricing */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Simple <span className="text-primary">Pricing</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="text-4xl font-bold text-primary mb-4">$0<span className="text-lg text-muted-foreground">/month</span></div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span>50 questions per month</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span>Basic AI responses</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span>Multi-language support</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline">Get Started</Button>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold">Elite</h3>
                  <Badge className="bg-primary text-primary-foreground">Popular</Badge>
                </div>
                <div className="text-4xl font-bold text-primary mb-4">$50<span className="text-lg text-muted-foreground">/month</span></div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span>150 questions per month</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span>Advanced AI (GPT-4o)</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span>Document analysis</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button className="w-full bg-primary text-primary-foreground">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Elite
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands who trust LexAI for their legal needs
          </p>
          <Button size="lg" className="bg-primary text-primary-foreground">
            Start Your Free Trial
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
