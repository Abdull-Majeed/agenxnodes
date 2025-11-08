import { LucideIcon } from "lucide-react";
import { 
  Zap, 
  GitBranch, 
  Database, 
  RefreshCw, 
  Code2, 
  Filter,
  Mail,
  MessageSquare,
  FileText,
  Cloud,
  Brain,
  Sparkles,
  Diamond
} from "lucide-react";

export type NodeType = 'trigger' | 'action' | 'data' | 'database' | 'flow' | 'ai';

export interface NodeCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  type: NodeType;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  category: string;
  name: string;
  icon: LucideIcon;
  position: { x: number; y: number };
  selected?: boolean;
  config?: Record<string, any>;
}

export const nodeCategories: Record<string, NodeCategory[]> = {
  Triggers: [
    { id: 'webhook', name: 'Webhook', icon: Zap, color: '#FFBA08', type: 'trigger' },
    { id: 'schedule', name: 'Schedule', icon: RefreshCw, color: '#FAA307', type: 'trigger' },
    { id: 'email-trigger', name: 'Email Received', icon: Mail, color: '#E85D04', type: 'trigger' },
  ],
  Actions: [
    { id: 'http', name: 'HTTP Request', icon: Cloud, color: '#0072FF', type: 'action' },
    { id: 'email-send', name: 'Send Email', icon: Mail, color: '#00C6FF', type: 'action' },
    { id: 'slack', name: 'Slack Message', icon: MessageSquare, color: '#FAA307', type: 'action' },
  ],
  Data: [
    { id: 'transform', name: 'Transform Data', icon: RefreshCw, color: '#E85D04', type: 'data' },
    { id: 'filter', name: 'Filter', icon: Filter, color: '#FFBA08', type: 'data' },
    { id: 'merge', name: 'Merge', icon: GitBranch, color: '#00C6FF', type: 'data' },
  ],
  Database: [
    { id: 'mysql', name: 'MySQL', icon: Database, color: '#0072FF', type: 'database' },
    { id: 'postgres', name: 'PostgreSQL', icon: Database, color: '#00C6FF', type: 'database' },
    { id: 'mongodb', name: 'MongoDB', icon: Database, color: '#FAA307', type: 'database' },
  ],
  Flow: [
    { id: 'if', name: 'If Condition', icon: Diamond, color: '#FFBA08', type: 'flow' },
    { id: 'switch', name: 'Switch', icon: GitBranch, color: '#E85D04', type: 'flow' },
    { id: 'loop', name: 'Loop', icon: RefreshCw, color: '#0072FF', type: 'flow' },
  ],
  AI: [
    { id: 'openai', name: 'OpenAI', icon: Brain, color: '#00C6FF', type: 'ai' },
    { id: 'claude', name: 'Claude', icon: Sparkles, color: '#FFBA08', type: 'ai' },
    { id: 'text-analysis', name: 'Text Analysis', icon: FileText, color: '#FAA307', type: 'ai' },
    { id: 'ml-model', name: 'ML Model', icon: Code2, color: '#E85D04', type: 'ai' },
  ],
};

export function getNodeStyle(type: NodeType): string {
  switch (type) {
    case 'trigger':
      return 'rounded-full';
    case 'action':
      return 'rounded-xl';
    case 'data':
      return 'rounded-lg';
    case 'database':
      return 'rounded-2xl';
    case 'flow':
      return 'rotate-45';
    case 'ai':
      return 'rounded-2xl';
    default:
      return 'rounded-xl';
  }
}
