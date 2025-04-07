import { useState } from "react";
import type { SummaryWithScreenshots } from "@/types";
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
  Cpu,
  FileText
} from "lucide-react";
import { regenerateSummary, fetchTranscriptForSummary } from "../lib/api";
import { useToast } from "@/hooks/use-toast";
import { TranscriptHighlighter } from "./interactive-transcript";

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
  const [activeTab, setActiveTab] = useState<"transcript" | "regenerate" | "interactive">("transcript");
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
        <h3 className="text-lg font-semibold text-slate-700">Advanced Options</h3>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "transcript" | "regenerate" | "interactive")}>
        <div className="px-4 pt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transcript">View Transcript</TabsTrigger>
            <TabsTrigger value="interactive">Interactive</TabsTrigger>
            <TabsTrigger value="regenerate">Regenerate</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="transcript" className="p-4">
          <div className="mb-2">
            <p className="text-sm text-slate-500">Full transcript of the video:</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-md max-h-96 overflow-y-auto">
            {summary.transcript ? (
              <pre className="text-sm whitespace-pre-wrap font-sans text-slate-700">
                {summary.transcript}
              </pre>
            ) : (
              <div className="text-base text-slate-600 p-4">
                <p className="font-medium mb-2">Transcript not available</p>
                <p className="mb-2">For newly created summaries, the full transcript will be stored and available here.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Interactive Transcript Tab */}
        <TabsContent value="interactive" className="p-4">
          <div className="mb-2">
            <p className="text-sm text-slate-500">
              Highlight parts of the transcript to add them as key points. This helps customize the summary with specific sections you find important.
            </p>
          </div>
          
          {summary.transcript ? (
            <TranscriptHighlighter
              summary={summary}
              onSummaryUpdate={onSummaryUpdate || (() => {})}
            />
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
              <p className="text-sm text-amber-700">
                <strong>Note:</strong> Interactive highlighting requires the full transcript.
                Please fetch the transcript first to enable this feature.
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
                      <FileText className="h-4 w-4 mr-2" />
                      Fetch Transcript
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Regenerate Tab */}
        <TabsContent value="regenerate" className="p-4">
          <div className="mb-4">
            <p className="text-sm text-slate-500 mb-2">
              Select a prompt style and regenerate the summary without burning additional API tokens.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mb-3">
              <p className="text-sm text-blue-700">
                <strong>New!</strong> Try the <strong>AI Tech</strong> prompt for videos about AI models like Llama, GPT, and Claude.
              </p>
            </div>
            
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {promptTypes.map((promptType) => (
                    <Button
                      key={promptType.id}
                      variant={selectedPrompt === promptType.id as any ? "default" : "outline"}
                      size="sm"
                      className={`justify-start text-sm sm:text-base ${promptType.id === 'technical_ai' ? 'border-blue-400 hover:border-blue-500' : ''} ${selectedPrompt === promptType.id ? 'bg-primary-600' : ''}`}
                      onClick={() => setSelectedPrompt(promptType.id as "standard" | "detailed" | "concise" | "business" | "academic" | "technical_ai")}
                    >
                      <span className="flex items-center">
                        {promptType.icon} 
                        <span className="ml-1">{promptType.label}</span>
                      </span>
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