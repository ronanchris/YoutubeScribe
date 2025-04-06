import { useState } from "react";
import { SummaryWithScreenshots } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, 
  Briefcase, 
  BookOpen, 
  MessageSquare, 
  Library,
  Loader2 
} from "lucide-react";
import { regenerateSummary } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface PromptSelectorProps {
  summary: SummaryWithScreenshots;
  onSummaryUpdate?: (updatedSummary: SummaryWithScreenshots) => void;
}

const promptTypes = [
  { id: "standard", label: "Standard", icon: <Sparkles className="h-4 w-4 mr-1" /> },
  { id: "detailed", label: "Detailed", icon: <Library className="h-4 w-4 mr-1" /> },
  { id: "concise", label: "Concise", icon: <MessageSquare className="h-4 w-4 mr-1" /> },
  { id: "business", label: "Business", icon: <Briefcase className="h-4 w-4 mr-1" /> },
  { id: "academic", label: "Academic", icon: <BookOpen className="h-4 w-4 mr-1" /> },
] as const;

export default function PromptSelector({ summary, onSummaryUpdate }: PromptSelectorProps) {
  const [activeTab, setActiveTab] = useState<"transcript" | "regenerate">("transcript");
  const [selectedPrompt, setSelectedPrompt] = useState<(typeof promptTypes)[number]["id"]>("standard");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();

  // Handle regenerating the summary with a new prompt
  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      
      // Call the API to regenerate the summary
      const regeneratedSummary = await regenerateSummary(summary.id, selectedPrompt);
      
      // Update the local summary
      if (onSummaryUpdate) {
        onSummaryUpdate(regeneratedSummary);
      }
      
      toast({
        title: "Summary regenerated",
        description: `Successfully regenerated summary using ${selectedPrompt} prompt`,
      });
      
    } catch (error) {
      console.error("Error regenerating summary:", error);
      toast({
        title: "Error regenerating summary",
        description: "Failed to regenerate the summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Card className="mt-6 border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-md font-semibold text-slate-700">Advanced Options</h3>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "transcript" | "regenerate")}>
        <div className="px-4 pt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transcript">View Transcript</TabsTrigger>
            <TabsTrigger value="regenerate">Regenerate Summary</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="transcript" className="p-4">
          <div className="mb-2">
            <p className="text-sm text-slate-500">Full transcript of the video:</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-md max-h-96 overflow-y-auto">
            <pre className="text-xs whitespace-pre-wrap font-sans text-slate-700">
              {summary.transcript || "No transcript available."}
            </pre>
          </div>
        </TabsContent>
        
        <TabsContent value="regenerate" className="p-4">
          <div className="mb-4">
            <p className="text-sm text-slate-500 mb-2">
              Select a prompt style and regenerate the summary without burning additional API tokens.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
              {promptTypes.map((promptType) => (
                <Button
                  key={promptType.id}
                  variant={selectedPrompt === promptType.id ? "default" : "outline"}
                  size="sm"
                  className="justify-start"
                  onClick={() => setSelectedPrompt(promptType.id)}
                >
                  {promptType.icon} {promptType.label}
                </Button>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-end">
              <Button 
                onClick={handleRegenerate} 
                disabled={isRegenerating}
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Regenerate Summary
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}