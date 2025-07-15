import React, { useState, useCallback } from "react";
import { Upload, FileText, AlertCircle, CheckCircle, Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface AnalysisResult {
  id: string;
  fileName: string;
  status: "analyzing" | "completed" | "error";
  progress: number;
  summary?: string;
  keyPoints?: string[];
  riskLevel?: "low" | "medium" | "high";
  recommendations?: string[];
  entities?: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
}

interface DocumentAnalyzerProps {
  onFileUpload: (files: File[]) => void;
  analyses: AnalysisResult[];
  className?: string;
}

export function DocumentAnalyzer({ 
  onFileUpload, 
  analyses, 
  className = "" 
}: DocumentAnalyzerProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => 
      file.type === "application/pdf" || 
      file.type === "application/msword" ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === "text/plain"
    );
    
    if (validFiles.length > 0) {
      onFileUpload(validFiles);
    }
  }, [onFileUpload]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onFileUpload(files);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload area */}
      <Card className="glass-morphism">
        <CardHeader>
          <CardTitle className="text-gradient">Document Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300",
              dragActive 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50",
              "cursor-pointer"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Upload Legal Documents
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop your files here, or click to browse
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Supports PDF, DOC, DOCX, and TXT files
            </p>
            
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileInput}
              className="hidden"
              id="document-upload"
            />
            <label htmlFor="document-upload">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Choose Files
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Analysis results */}
      {analyses.length > 0 && (
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <AnalysisCard key={analysis.id} analysis={analysis} />
          ))}
        </div>
      )}
    </div>
  );
}

function AnalysisCard({ analysis }: { analysis: AnalysisResult }) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-green-500";
      case "medium": return "text-yellow-500";
      case "high": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "low": return "default";
      case "medium": return "secondary";
      case "high": return "destructive";
      default: return "outline";
    }
  };

  return (
    <Card className="glass-morphism">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <h4 className="font-semibold">{analysis.fileName}</h4>
              <div className="flex items-center space-x-2 mt-1">
                {analysis.status === "analyzing" && (
                  <>
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-muted-foreground">Analyzing...</span>
                  </>
                )}
                {analysis.status === "completed" && (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500">Analysis complete</span>
                  </>
                )}
                {analysis.status === "error" && (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-500">Analysis failed</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {analysis.riskLevel && (
            <Badge variant={getRiskBadgeVariant(analysis.riskLevel)}>
              {analysis.riskLevel.toUpperCase()} RISK
            </Badge>
          )}
        </div>

        {analysis.status === "analyzing" && (
          <Progress value={analysis.progress} className="mt-3" />
        )}
      </CardHeader>

      {analysis.status === "completed" && analysis.summary && (
        <CardContent className="space-y-4">
          {/* Summary */}
          <div>
            <h5 className="font-semibold mb-2 text-gradient">Summary</h5>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          {/* Key Points */}
          {analysis.keyPoints && analysis.keyPoints.length > 0 && (
            <div>
              <h5 className="font-semibold mb-2 text-gradient">Key Points</h5>
              <ul className="space-y-1">
                {analysis.keyPoints.map((point, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div>
              <h5 className="font-semibold mb-2 text-gradient">Recommendations</h5>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <Alert key={index} className="border-primary/20 bg-primary/5">
                    <AlertDescription className="text-sm">
                      {rec}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Entities */}
          {analysis.entities && analysis.entities.length > 0 && (
            <div>
              <h5 className="font-semibold mb-2 text-gradient">Identified Entities</h5>
              <div className="flex flex-wrap gap-2">
                {analysis.entities.map((entity, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {entity.type}: {entity.value}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-2 pt-4 border-t border-border/50">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button variant="ghost" size="sm">
              Ask Questions
            </Button>
          </div>
        </CardContent>
      )}

      {analysis.status === "error" && (
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to analyze document. Please try again or contact support.
            </AlertDescription>
          </Alert>
        </CardContent>
      )}
    </Card>
  );
}

export function AnalysisHistory({ 
  analyses, 
  onAnalysisSelect 
}: { 
  analyses: AnalysisResult[]; 
  onAnalysisSelect: (analysis: AnalysisResult) => void;
}) {
  const completedAnalyses = analyses.filter(a => a.status === "completed");

  if (completedAnalyses.length === 0) {
    return (
      <Card className="glass-morphism">
        <CardContent className="py-8 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No analyses yet</h3>
          <p className="text-muted-foreground text-sm">
            Upload documents to see analysis history here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle>Analysis History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {completedAnalyses.map((analysis) => (
          <div
            key={analysis.id}
            onClick={() => onAnalysisSelect(analysis)}
            className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-primary/50 cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-4 h-4 text-primary" />
              <div>
                <p className="font-medium text-sm">{analysis.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {analysis.riskLevel} risk level
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              View
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
