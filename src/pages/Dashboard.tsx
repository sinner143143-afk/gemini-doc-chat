import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DocumentSidebar } from "@/components/DocumentSidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  title: string;
  content: string;
  file_type: string;
  created_at: string;
}

const Dashboard = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedDocContent, setSelectedDocContent] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (selectedDocId) {
      const doc = documents.find((d) => d.id === selectedDocId);
      if (doc) {
        setSelectedDocContent(doc.content);
      }
    }
  }, [selectedDocId, documents]);

  const loadDocuments = async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error loading documents",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setDocuments(data || []);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            DocChat AI
          </h1>
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        <DocumentSidebar
          documents={documents}
          selectedDocId={selectedDocId}
          onSelectDoc={setSelectedDocId}
          onDocumentsChange={loadDocuments}
        />
        <div className="flex-1">
          <ChatInterface documentId={selectedDocId} documentContent={selectedDocContent} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
