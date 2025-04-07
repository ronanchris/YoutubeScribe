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
  Loader2,
  Cpu
} from "lucide-react";
import { regenerateSummary, fetchTranscriptForSummary } from "@/lib/api";
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
  { id: "technical_ai", label: "AI Tech", icon: <Cpu className="h-4 w-4 mr-1" /> },
] as const;

export default function PromptSelector({ summary, onSummaryUpdate }: PromptSelectorProps) {
  const [activeTab, setActiveTab] = useState<"transcript" | "regenerate">("transcript");
  const [selectedPrompt, setSelectedPrompt] = useState<"standard" | "detailed" | "concise" | "business" | "academic" | "technical_ai">("standard");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isFetchingTranscript, setIsFetchingTranscript] = useState(false);
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
  
  // Handle fetching the transcript for a summary that's missing one
  const handleFetchTranscript = async () => {
    try {
      setIsFetchingTranscript(true);
      
      // Call the API to fetch the transcript
      const updatedSummary = await fetchTranscriptForSummary(summary.id);
      
      // Update the local summary
      if (onSummaryUpdate) {
        onSummaryUpdate(updatedSummary);
      }
      
      toast({
        title: "Transcript fetched",
        description: "Successfully fetched and stored the transcript. You can now regenerate summaries.",
      });
      
    } catch (error) {
      console.error("Error fetching transcript:", error);
      toast({
        title: "Error fetching transcript",
        description: "Failed to fetch the transcript. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingTranscript(false);
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
            {summary.transcript ? (
              <pre className="text-xs whitespace-pre-wrap font-sans text-slate-700">
                {summary.transcript}
              </pre>
            ) : (
              <div className="text-sm text-slate-500 italic p-2">
                <p>Transcript not available for this summary.</p>
                <p className="mt-2">For newly created summaries, the full transcript will be stored and available here.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="regenerate" className="p-4">
          <div className="mb-4">
            <p className="text-sm text-slate-500 mb-2">
              Select a prompt style and regenerate the summary without burning additional API tokens.
              Try the new <span className="font-medium">AI Tech</span> prompt for videos about AI models like Llama, GPT, and Claude.
            </p>
            
            {!summary.transcript ? (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
                <p className="text-sm text-amber-700">
                  <strong>Note:</strong> This summary was created before transcript storage was implemented. 
                  Regeneration is only available for summaries that include the full transcript.
                </p>
                <div className="mt-3">
                  <Button 
                    variant="outline" 
                    className="bg-white border-amber-300 hover:bg-amber-100 text-amber-700 flex items-center"
                    onClick={handleFetchTranscript}
                    disabled={isFetchingTranscript}
                  >
                    {isFetchingTranscript ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Fetching transcript...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M21 15V6"></path>
                          <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
                          <path d="M12 12H3"></path>
                          <path d="M16 6H3"></path>
                          <path d="M12 18H3"></path>
                        </svg>
                        Fetch Transcript & Enable Regeneration
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-amber-600 mt-2">
                    <strong>Warning:</strong> This will call the YouTube API and OpenAI API to fetch and process the transcript, which will use API tokens.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                  {promptTypes.map((promptType) => (
                    <Button
                      key={promptType.id}
                      variant={selectedPrompt === promptType.id as any ? "default" : "outline"}
                      size="sm"
                      className="justify-start"
                      onClick={() => setSelectedPrompt(promptType.id as "standard" | "detailed" | "concise" | "business" | "academic" | "technical_ai")}
                    >
                      {promptType.icon} {promptType.label}
                    </Button>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleRegenerate} 
                    disabled={isRegenerating || !summary.transcript}
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
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}