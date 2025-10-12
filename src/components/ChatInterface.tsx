import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface ChatInterfaceProps {
  documentId: string | null;
  documentContent: string;
}

export const ChatInterface = ({ documentId, documentContent }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (documentId) {
      loadOrCreateSession();
    }
  }, [documentId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadOrCreateSession = async () => {
    if (!documentId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: sessions } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("document_id", documentId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (sessions && sessions.length > 0) {
        setSessionId(sessions[0].id);
        loadMessages(sessions[0].id);
      } else {
        const { data: newSession, error } = await supabase
          .from("chat_sessions")
          .insert({ user_id: user.id, document_id: documentId })
          .select()
          .single();

        if (error) throw error;
        setSessionId(newSession.id);
        setMessages([]);
      }
    } catch (error: any) {
      toast({
        title: "Session error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadMessages = async (sessId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessId)
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "Error loading messages",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setMessages((data || []) as Message[]);
  };

  const handleSend = async () => {
    if (!input.trim() || !sessionId || !documentContent) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    try {
      const { data: savedUserMsg, error: userError } = await supabase
        .from("chat_messages")
        .insert({
          session_id: sessionId,
          role: "user",
          content: userMessage,
        })
        .select()
        .single();

      if (userError) throw userError;
      setMessages((prev) => [...prev, savedUserMsg as Message]);

      const { data, error } = await supabase.functions.invoke("chat-with-document", {
        body: {
          message: userMessage,
          documentContent: documentContent,
          sessionId: sessionId,
        },
      });

      if (error) throw error;

      const assistantMsg = data.message;
      const { data: savedAssistantMsg, error: assistantError } = await supabase
        .from("chat_messages")
        .insert({
          session_id: sessionId,
          role: "assistant",
          content: assistantMsg,
        })
        .select()
        .single();

      if (assistantError) throw assistantError;
      setMessages((prev) => [...prev, savedAssistantMsg as Message]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!documentId) {
    return (
      <Card className="h-full flex items-center justify-center bg-card/50 backdrop-blur-sm border-border">
        <p className="text-muted-foreground">Select a document to start chatting</p>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col bg-card/50 backdrop-blur-sm border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Chat with Document
        </h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask a question about your document..."
            disabled={loading}
            className="bg-secondary border-border"
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
