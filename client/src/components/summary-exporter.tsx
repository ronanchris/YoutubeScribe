import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { FileDown, BookOpen, Code, ThumbsUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateHTML } from '@/lib/html-generator';
import jsPDF from 'jspdf';
import type { SummaryWithScreenshots } from '../types';

interface SummaryExporterProps {
  summary: SummaryWithScreenshots;
}

export default function SummaryExporter({ summary }: SummaryExporterProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  // Helper function to sanitize filenames
  const sanitizeFilename = (name: string): string => {
    return name
      .replace(/[^a-z0-9]/gi, '_') // Replace non-alphanumeric with underscore
      .replace(/_+/g, '_')         // Replace multiple underscores with single
      .substring(0, 50);           // Limit length
  };

  // Create filename based on video title
  const getFilename = (extension: string): string => {
    const base = sanitizeFilename(summary.videoTitle || 'video_summary');
    return `${base}.${extension}`;
  };

  // Export summary as plain text (markdown format)
  const exportAsMarkdown = () => {
    try {
      setIsExporting(true);
      
      // Create markdown content
      let markdown = `# ${summary.videoTitle}\n\n`;
      markdown += `> Video by ${summary.videoAuthor} - [Watch on YouTube](${summary.videoUrl})\n\n`;
      
      // Key points
      markdown += `## Key Points\n\n`;
      summary.keyPoints.forEach(point => {
        markdown += `- ${point}\n`;
      });
      markdown += `\n`;
      
      // Main summary
      markdown += `## Summary\n\n${summary.summary}\n\n`;
      
      // Structured outline
      markdown += `## Outline\n\n`;
      summary.structuredOutline.forEach(section => {
        markdown += `### ${section.title}\n\n`;
        section.items.forEach(item => {
          markdown += `- ${item}\n`;
        });
        markdown += `\n`;
      });

      // Create and download file
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getFilename('md');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Exported as Markdown",
        description: "Your summary has been downloaded as a Markdown file.",
      });
    } catch (error) {
      console.error('Error exporting as markdown:', error);
      toast({
        title: "Export failed",
        description: "There was a problem exporting your summary.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Export summary as HTML
  const exportAsHTML = () => {
    try {
      setIsExporting(true);
      
      // Generate HTML using our utility
      const html = generateHTML(summary);
      
      // Create and download file
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getFilename('html');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Exported as HTML",
        description: "Your summary has been downloaded as an HTML file.",
      });
    } catch (error) {
      console.error('Error exporting as HTML:', error);
      toast({
        title: "Export failed",
        description: "There was a problem exporting your summary.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Export summary as PDF using jsPDF
  const exportAsPDF = () => {
    try {
      setIsExporting(true);
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const usableWidth = pageWidth - (margin * 2);
      
      // Set font styles
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      
      // Title
      const title = summary.videoTitle;
      doc.text(title, margin, 20);
      
      // Author and link
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.text(`Video by ${summary.videoAuthor}`, margin, 30);
      doc.text(`URL: ${summary.videoUrl}`, margin, 35);
      
      // Key Points
      let yPosition = 45;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Key Points", margin, yPosition);
      yPosition += 8;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      summary.keyPoints.forEach(point => {
        // Check if we need a new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        const lines = doc.splitTextToSize(`• ${point}`, usableWidth);
        doc.text(lines, margin, yPosition);
        yPosition += (lines.length * 5) + 3;
      });
      
      // Main Summary
      yPosition += 5;
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Summary", margin, yPosition);
      yPosition += 8;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const summaryLines = doc.splitTextToSize(summary.summary, usableWidth);
      doc.text(summaryLines, margin, yPosition);
      yPosition += (summaryLines.length * 5) + 10;
      
      // Structured outline
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Outline", margin, yPosition);
      yPosition += 10;
      
      summary.structuredOutline.forEach(section => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(section.title, margin, yPosition);
        yPosition += 7;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        
        section.items.forEach(item => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          const itemLines = doc.splitTextToSize(`• ${item}`, usableWidth);
          doc.text(itemLines, margin, yPosition);
          yPosition += (itemLines.length * 5) + 3;
        });
        
        yPosition += 5;
      });
      
      // Save the PDF
      doc.save(getFilename('pdf'));
      
      toast({
        title: "Exported as PDF",
        description: "Your summary has been downloaded as a PDF file.",
      });
    } catch (error) {
      console.error('Error exporting as PDF:', error);
      toast({
        title: "Export failed",
        description: "There was a problem exporting your summary.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Export for Notion (special markdown with some additional formatting)
  const exportForNotion = () => {
    try {
      setIsExporting(true);
      
      // Create Notion-friendly markdown
      let markdown = `# ${summary.videoTitle}\n\n`;
      markdown += `Source: [YouTube - ${summary.videoAuthor}](${summary.videoUrl})\n\n`;
      
      // Add a divider that Notion recognizes
      markdown += `---\n\n`;
      
      // Key points as a toggle list in Notion
      markdown += `## Key Points\n\n`;
      summary.keyPoints.forEach(point => {
        markdown += `- ${point}\n`;
      });
      markdown += `\n`;
      
      // Main summary with a callout for Notion
      markdown += `## Summary\n\n`;
      markdown += `> 💡 ${summary.summary.replace(/\n/g, '\n> ')}\n\n`;
      
      // Structured outline as toggle lists
      markdown += `## Detailed Outline\n\n`;
      summary.structuredOutline.forEach(section => {
        markdown += `### ${section.title}\n\n`;
        section.items.forEach(item => {
          markdown += `- ${item}\n`;
        });
        markdown += `\n`;
      });
      
      // Add token usage info at the bottom
      if (summary.tokenUsage) {
        markdown += `---\n\n`;
        markdown += `**Generated with**: ${summary.tokenUsage.model || 'AI model'}\n`;
        markdown += `**Prompt type**: ${summary.tokenUsage.prompt_type || summary.promptTemplate || 'Standard'}\n`;
      }

      // Create and download file
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getFilename('md');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Exported for Notion",
        description: "Your summary has been downloaded in Notion-compatible format. Import it into Notion as a markdown file.",
      });
    } catch (error) {
      console.error('Error exporting for Notion:', error);
      toast({
        title: "Export failed",
        description: "There was a problem exporting your summary.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          <FileDown className="h-4 w-4 mr-2" />
          Export Summary
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={exportAsMarkdown} disabled={isExporting}>
          <Code className="h-4 w-4 mr-2" />
          Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsHTML} disabled={isExporting}>
          <Code className="h-4 w-4 mr-2" />
          HTML
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsPDF} disabled={isExporting}>
          <FileDown className="h-4 w-4 mr-2" />
          PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportForNotion} disabled={isExporting}>
          <BookOpen className="h-4 w-4 mr-2" />
          Notion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}