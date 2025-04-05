import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Book, Tag, Sparkles, X } from "lucide-react";

interface GlossaryTagsProps {
  summaryContent: string;
  onTagSelect?: (tag: string) => void;
}

export default function GlossaryTags({ summaryContent, onTagSelect }: GlossaryTagsProps) {
  const [terms, setTerms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Extract tags when component mounts or summary content changes
  useEffect(() => {
    if (!summaryContent) return;
    
    const extractTerms = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch('/api/extract-terms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ summaryContent }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to extract key terms');
        }
        
        const data = await response.json();
        setTerms(data.terms || []);
      } catch (error) {
        console.error('Error extracting terms:', error);
        toast({
          title: "Could not generate terms",
          description: "Using default terms based on content.",
          variant: "destructive",
        });
        
        // Fallback: Extract some basic terms using regex
        const basicTerms = extractBasicTerms(summaryContent);
        setTerms(basicTerms);
      } finally {
        setIsLoading(false);
      }
    };
    
    extractTerms();
  }, [summaryContent, toast]);
  
  // Simple regex-based term extraction as a fallback
  const extractBasicTerms = (text: string): string[] => {
    // Extract capitalized phrases as potential technical terms
    const matches = text.match(/\b[A-Z][a-zA-Z0-9]+([ -][A-Z][a-zA-Z0-9]+)*\b/g) || [];
    
    // Deduplicate and limit to 10 terms
    const uniqueTerms = Array.from(new Set(matches));
    return uniqueTerms.slice(0, 10);
  };
  
  // Handle tag selection
  const toggleTag = (term: string) => {
    const newSelected = new Set(selectedTags);
    
    if (newSelected.has(term)) {
      newSelected.delete(term);
    } else {
      newSelected.add(term);
    }
    
    setSelectedTags(newSelected);
    
    // Call the callback if provided
    if (onTagSelect) {
      onTagSelect(term);
    }
  };
  
  // Handle clearing all selected tags
  const clearSelectedTags = () => {
    setSelectedTags(new Set());
  };
  
  if (!terms.length && !isLoading) {
    return null;
  }
  
  return (
    <Card className="p-4 mb-6 border-dashed border-slate-200 bg-slate-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium flex items-center text-slate-700">
          <Book className="h-4 w-4 mr-1 text-primary" />
          Glossary Terms
        </h3>
        
        <div className="flex gap-2">
          {selectedTags.size > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearSelectedTags}
              className="h-7 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isLoading}
                  className="h-7 px-2 text-xs"
                  onClick={() => {
                    const extractTerms = async () => {
                      try {
                        setIsLoading(true);
                        
                        const response = await fetch('/api/extract-terms', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ summaryContent }),
                        });
                        
                        if (!response.ok) {
                          throw new Error('Failed to extract key terms');
                        }
                        
                        const data = await response.json();
                        setTerms(data.terms || []);
                        toast({
                          title: "Refreshed glossary terms",
                          description: "New key terms have been generated.",
                        });
                      } catch (error) {
                        console.error('Error refreshing terms:', error);
                        toast({
                          title: "Could not refresh terms",
                          description: "Please try again later.",
                          variant: "destructive",
                        });
                      } finally {
                        setIsLoading(false);
                      }
                    };
                    
                    extractTerms();
                  }}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Regenerate key terms</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {isLoading ? (
          <div className="flex items-center justify-center w-full py-2">
            <div className="animate-pulse flex space-x-2 items-center">
              <div className="h-2 w-8 bg-slate-200 rounded"></div>
              <div className="h-2 w-12 bg-slate-200 rounded"></div>
              <div className="h-2 w-10 bg-slate-200 rounded"></div>
            </div>
          </div>
        ) : (
          terms.map((term) => (
            <Badge
              key={term}
              variant={selectedTags.has(term) ? "default" : "outline"}
              className={`cursor-pointer hover:bg-slate-100 hover:text-slate-900 transition-colors ${
                selectedTags.has(term) 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-transparent text-slate-700'
              }`}
              onClick={() => toggleTag(term)}
            >
              <Tag className="h-3 w-3 mr-1" />
              {term}
            </Badge>
          ))
        )}
      </div>
    </Card>
  );
}