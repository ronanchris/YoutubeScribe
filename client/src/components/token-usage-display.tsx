import { useState } from "react";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { ChevronDown, ChevronUp, Cpu, DollarSign } from "lucide-react";

interface TokenUsageProps {
  tokenUsage: any; // Using any for flexibility as the structure may evolve
}

export default function TokenUsageDisplay({ tokenUsage }: TokenUsageProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle case when tokenUsage is not available
  if (!tokenUsage || Object.keys(tokenUsage).length === 0) {
    return null;
  }

  // Format a number to have commas for thousands
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Format a cost as USD
  const formatCost = (cost: number): string => {
    return cost.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 6,
      maximumFractionDigits: 6
    });
  };

  return (
    <Card className="mt-2 bg-slate-50/50 border-slate-200">
      <CardHeader className="py-2 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Cpu className="h-4 w-4 mr-2 text-slate-500" />
            <CardTitle className="text-sm font-medium text-slate-700">
              AI Token Usage
            </CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription className="text-xs mt-0 text-slate-500">
          {isExpanded 
            ? "Detailed token usage for this AI-generated summary" 
            : `${formatNumber(tokenUsage.total_tokens)} tokens (${formatCost(tokenUsage.total_cost)})`
          }
        </CardDescription>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="py-2 px-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Category</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Prompt</TableCell>
                <TableCell>{formatNumber(tokenUsage.prompt_tokens)}</TableCell>
                <TableCell className="text-right">{formatCost(tokenUsage.prompt_cost)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Completion</TableCell>
                <TableCell>{formatNumber(tokenUsage.completion_tokens)}</TableCell>
                <TableCell className="text-right">{formatCost(tokenUsage.completion_cost)}</TableCell>
              </TableRow>
              <TableRow className="font-semibold">
                <TableCell className="font-medium">Total</TableCell>
                <TableCell>{formatNumber(tokenUsage.total_tokens)}</TableCell>
                <TableCell className="text-right">{formatCost(tokenUsage.total_cost)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          <div className="mt-2 text-xs text-slate-500">
            <p>Model: {tokenUsage.model || "gpt-4o"}</p>
            <p>Prompt Type: {tokenUsage.prompt_type || "standard"}</p>
            {tokenUsage.transcript_length && (
              <p>
                Transcript: {formatNumber(tokenUsage.transcript_length)} characters
                {tokenUsage.was_truncated && 
                  ` (truncated to ${formatNumber(tokenUsage.truncated_length)} characters)`
                }
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}