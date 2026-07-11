import React from 'react';
import {
  Bot,
  BrainCircuit,
  Braces,
  Brackets,
  CalendarClock,
  Circle,
  ClipboardList,
  Cloud,
  CreditCard,
  Database,
  DatabaseZap,
  Gem,
  Globe,
  Hand,
  Image,
  Mail,
  MailOpen,
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  Phone,
  Radio,
  Send,
  Sheet,
  Slack,
  Smile,
  Split,
  Table2,
  Timer,
  Webhook,
  Workflow,
  BookOpen
} from 'lucide-react';

const iconMap = {
  Webhook,
  CalendarClock,
  Hand,
  ClipboardList,
  MailOpen,
  Radio,
  MessagesSquare,
  DatabaseZap,
  Gem,
  Bot,
  BrainCircuit,
  Smile,
  Image,
  Workflow,
  Mail,
  Slack,
  MessageSquare,
  Send,
  Phone,
  MessageCircle,
  Globe,
  Braces,
  Brackets,
  Split,
  Timer,
  Sheet,
  Table2,
  BookOpen,
  Cloud,
  Database,
  CreditCard
};

const NodeIcon = ({ name, className }) => {
  const Icon = iconMap[name] || Circle;
  return <Icon className={className} strokeWidth={1.8} aria-hidden />;
};

export default NodeIcon;
