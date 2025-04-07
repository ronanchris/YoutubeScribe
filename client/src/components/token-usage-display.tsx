import { Cpu, FileText, DollarSign } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TokenUsage } from '../types';

interface TokenUsageDisplayProps {
  tokenUsage: TokenUsage;
}

export default function TokenUsageDisplay({ tokenUsage }: TokenUsageDisplayProps) {
  // Helper to format token numbers with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Helper to format cost display
  const formatCost = (cost: number): string => {
    return `$${cost.toFixed(4)}`;
  };

  // Calculate percentage for truncation display
  const truncatedPercentage = tokenUsage.was_truncated && tokenUsage.transcript_length && tokenUsage.truncated_length
    ? Math.round((tokenUsage.truncated_length / tokenUsage.transcript_length) * 100)
    : 100;

  return (
    <Card className="mt-6 border border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-semibold text-slate-700 flex items-center">
          <Cpu className="h-4 w-4 mr-2" />
          Token Usage
        </CardTitle>
        <CardDescription>
          Details about OpenAI API usage for this summary
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-slate-50 p-3 rounded-md">
            <div className="text-sm text-slate-500">Prompt Tokens</div>
            <div className="text-lg font-medium mt-1">{formatNumber(tokenUsage.prompt_tokens)}</div>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-md">
            <div className="text-sm text-slate-500">Completion Tokens</div>
            <div className="text-lg font-medium mt-1">{formatNumber(tokenUsage.completion_tokens)}</div>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-md">
            <div className="text-sm text-slate-500">Total Tokens</div>
            <div className="text-lg font-medium mt-1">{formatNumber(tokenUsage.total_tokens)}</div>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-md">
            <div className="text-sm text-slate-500">Total Cost</div>
            <div className="text-lg font-medium mt-1 flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              {formatCost(tokenUsage.total_cost)}
            </div>
          </div>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="details">
            <AccordionTrigger className="text-sm">View Detailed Information</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {/* Cost breakdown */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-slate-500">Prompt Cost:</div>
                  <div>{formatCost(tokenUsage.prompt_cost)}</div>
                  
                  <div className="text-slate-500">Completion Cost:</div>
                  <div>{formatCost(tokenUsage.completion_cost)}</div>
                </div>
                
                {/* Model information */}
                <div className="border-t pt-3 mt-3">
                  <div className="flex items-center mb-2">
                    <Cpu className="h-4 w-4 mr-2 text-slate-500" />
                    <span className="text-sm font-medium">Model Information</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-slate-500">Model Used:</div>
                    <div>{tokenUsage.model || "OpenAI GPT Model"}</div>
                    
                    <div className="text-slate-500">Prompt Type:</div>
                    <div>{tokenUsage.prompt_type || "Standard"}</div>
                  </div>
                </div>
                
                {/* Transcript statistics if available */}
                {tokenUsage.transcript_length && (
                  <div className="border-t pt-3 mt-3">
                    <div className="flex items-center mb-2">
                      <FileText className="h-4 w-4 mr-2 text-slate-500" />
                      <span className="text-sm font-medium">Transcript Statistics</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-slate-500">Full Length:</div>
                      <div>{formatNumber(tokenUsage.transcript_length)} characters</div>
                      
                      {tokenUsage.was_truncated && tokenUsage.truncated_length && (
                        <>
                          <div className="text-slate-500">Used Length:</div>
                          <div>{formatNumber(tokenUsage.truncated_length)} characters ({truncatedPercentage}%)</div>
                          
                          <div className="text-slate-500">Truncated:</div>
                          <div className="text-amber-600">Yes - transcript was too long for model</div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}