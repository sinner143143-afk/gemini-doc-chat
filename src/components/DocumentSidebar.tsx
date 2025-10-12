import { useState } from "react";
import { Plus, FileText, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";

interface Document {
  id: string;
  title: string;
  file_type: string;
  created_at: string;
}

interface DocumentSidebarProps {
  documents: Document[];
  selectedDocId: string | null;
  onSelectDoc: (id: string) => void;
  onDocumentsChange: () => void;
}

export const DocumentSidebar = ({
  documents,
  selectedDocId,
  onSelectDoc,
  onDocumentsChange,
}: DocumentSidebarProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const extractTextFromPDF = async (file: File): Promise<string> => {
    // Set the worker source for PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n\n";
    }
    
    return fullText.trim();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      let text: string;
      
      // Handle PDF files differently
      if (file.type === "application/pdf") {
        text = await extractTextFromPDF(file);
      } else {
        text = await file.text();
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("documents").insert({
        user_id: user.id,
        title: file.name,
        content: text,
        file_type: file.type,
        file_size: file.size,
      });

      if (error) throw error;
      
      toast({ title: "Document uploaded successfully!" });
      onDocumentsChange();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw error;
      
      toast({ title: "Document deleted" });
      onDocumentsChange();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="h-full w-80 flex flex-col bg-card/80 backdrop-blur-sm border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Documents
        </h2>
        <label htmlFor="file-upload">
          <Button
            className="w-full bg-primary hover:bg-primary/90"
            disabled={uploading}
            asChild
          >
            <span>
              {uploading ? (
                <Upload className="mr-2 h-4 w-4 animate-pulse" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Upload Document
            </span>
          </Button>
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".txt,.md,.pdf,.doc,.docx"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-secondary/80 group ${
                selectedDocId === doc.id ? "bg-secondary" : ""
              }`}
              onClick={() => onSelectDoc(doc.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <FileText className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(doc.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
