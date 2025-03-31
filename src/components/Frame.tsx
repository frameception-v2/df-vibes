"use client";

import { useEffect, useCallback, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useFrameSDK } from "~/hooks/useFrameSDK";
import { PROJECT_TITLE } from "~/lib/constants";

// Frame creation states
type FrameState = "design" | "preview" | "deploy" | "success";

// Frame template types
type FrameTemplate = {
  id: string;
  name: string;
  description: string;
  prompt: string;
};

// Sample templates
const TEMPLATES: FrameTemplate[] = [
  {
    id: "poll",
    name: "Poll",
    description: "Create a simple poll with multiple options",
    prompt: "Create a poll about favorite programming languages with options: JavaScript, Python, Rust, Other"
  },
  {
    id: "quiz",
    name: "Quiz",
    description: "Create a quiz with questions and answers",
    prompt: "Create a quiz about web3 knowledge with 3 questions"
  },
  {
    id: "profile",
    name: "Profile Card",
    description: "Display user profile information",
    prompt: "Create a profile card that shows user's name, bio, and stats"
  },
  {
    id: "meme",
    name: "Meme Generator",
    description: "Generate custom memes",
    prompt: "Create a meme generator with customizable text"
  }
];

function DesignTab({ 
  prompt, 
  setPrompt, 
  onGenerate, 
  isGenerating 
}: { 
  prompt: string; 
  setPrompt: (prompt: string) => void; 
  onGenerate: () => void;
  isGenerating: boolean;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const selectTemplate = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setPrompt(template.prompt);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {TEMPLATES.map((template) => (
          <Button
            key={template.id}
            variant={selectedTemplate === template.id ? "default" : "outline"}
            className="h-auto py-2 justify-start flex flex-col items-start"
            onClick={() => selectTemplate(template.id)}
          >
            <span className="font-medium">{template.name}</span>
            <span className="text-xs text-muted-foreground">{template.description}</span>
          </Button>
        ))}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="prompt">Describe your frame</Label>
        <Textarea
          id="prompt"
          placeholder="Describe what you want your frame to do..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
      
      <Button 
        onClick={onGenerate} 
        disabled={!prompt.trim() || isGenerating} 
        className="w-full"
      >
        {isGenerating ? "Generating..." : "Generate Frame"}
      </Button>
    </div>
  );
}

function PreviewTab({ 
  frameCode, 
  onDeploy 
}: { 
  frameCode: string; 
  onDeploy: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="border rounded-md p-2 bg-muted/50 overflow-auto max-h-[200px]">
        <pre className="text-xs">{frameCode}</pre>
      </div>
      
      <div className="border rounded-md p-4 bg-background">
        <div className="text-center text-sm text-muted-foreground mb-2">Frame Preview</div>
        <div className="border rounded-md p-2 h-[150px] flex items-center justify-center">
          <span className="text-sm text-muted-foreground">Preview will appear here</span>
        </div>
      </div>
      
      <Button onClick={onDeploy} className="w-full">
        Deploy to Modal.com
      </Button>
    </div>
  );
}

function DeployTab({ 
  deployStatus, 
  deployUrl 
}: { 
  deployStatus: "deploying" | "success" | "error"; 
  deployUrl: string;
}) {
  return (
    <div className="space-y-4">
      {deployStatus === "deploying" && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Deploying your frame to Modal.com...</p>
          <p className="text-xs text-muted-foreground mt-2">This may take a minute</p>
        </div>
      )}
      
      {deployStatus === "success" && (
        <div className="text-center py-4 space-y-4">
          <div className="bg-green-100 text-green-800 rounded-full h-12 w-12 flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h3 className="font-medium">Frame Deployed Successfully!</h3>
          <div className="space-y-2">
            <p className="text-sm">Your frame is now live at:</p>
            <div className="flex items-center space-x-2">
              <Input value={deployUrl} readOnly className="text-xs" />
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(deployUrl)}>
                Copy
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {deployStatus === "error" && (
        <div className="text-center py-4">
          <div className="bg-red-100 text-red-800 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </div>
          <h3 className="font-medium text-red-800">Deployment Failed</h3>
          <p className="text-sm mt-2">There was an error deploying your frame. Please try again.</p>
          <Button variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}

export default function Frame() {
  const { isSDKLoaded, sdk, context } = useFrameSDK();
  const [currentState, setCurrentState] = useState<FrameState>("design");
  const [prompt, setPrompt] = useState("");
  const [frameCode, setFrameCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [deployStatus, setDeployStatus] = useState<"deploying" | "success" | "error">("deploying");
  const [deployUrl, setDeployUrl] = useState("");
  
  // Mock function to generate frame code from prompt
  const generateFrameCode = async (promptText: string) => {
    setIsGenerating(true);
    
    // Simulate API call to LLM
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock response
    const mockCode = `
import { Button, Card, Text } from "@frames.js/render";

// Generated from prompt: "${promptText}"
export default function MyFrame() {
  return (
    <Card>
      <Text>This is your custom frame</Text>
      <Button>Option 1</Button>
      <Button>Option 2</Button>
    </Card>
  );
}`;
    
    setFrameCode(mockCode);
    setIsGenerating(false);
    setCurrentState("preview");
  };
  
  // Mock function to deploy to Modal.com
  const deployToModal = async () => {
    setCurrentState("deploy");
    setDeployStatus("deploying");
    
    // Simulate deployment
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setDeployStatus("success");
    setDeployUrl("https://vibes-frame-12345.modal.run");
  };
  
  // Handle tab changes
  const handleTabChange = (value: string) => {
    if (value === "design" && currentState !== "design") {
      setCurrentState("design");
    } else if (value === "preview" && frameCode && currentState !== "preview") {
      setCurrentState("preview");
    } else if (value === "deploy" && currentState === "preview") {
      deployToModal();
    }
  };
  
  if (!isSDKLoaded) {
    return <div className="flex items-center justify-center h-[300px]">Loading...</div>;
  }

  return (
    <div className="w-full max-w-[300px] mx-auto py-2 px-2">
      <Card>
        <CardHeader>
          <CardTitle>{PROJECT_TITLE}</CardTitle>
          <CardDescription>
            Create and deploy Farcaster frames with AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            value={currentState} 
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger 
                value="preview" 
                disabled={!frameCode}
              >
                Preview
              </TabsTrigger>
              <TabsTrigger 
                value="deploy" 
                disabled={currentState !== "preview" && currentState !== "deploy"}
              >
                Deploy
              </TabsTrigger>
            </TabsList>
            <TabsContent value="design" className="mt-4">
              <DesignTab 
                prompt={prompt} 
                setPrompt={setPrompt} 
                onGenerate={() => generateFrameCode(prompt)}
                isGenerating={isGenerating}
              />
            </TabsContent>
            <TabsContent value="preview" className="mt-4">
              <PreviewTab 
                frameCode={frameCode} 
                onDeploy={() => handleTabChange("deploy")}
              />
            </TabsContent>
            <TabsContent value="deploy" className="mt-4">
              <DeployTab 
                deployStatus={deployStatus} 
                deployUrl={deployUrl}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between text-xs text-muted-foreground">
          <span>Powered by Modal.com</span>
          <span>v1.0.0</span>
        </CardFooter>
      </Card>
    </div>
  );
}
