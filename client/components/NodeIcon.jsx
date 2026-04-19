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
  Code2,
  CreditCard,
  Database,
  Gem,
  Globe,
  Hand,
  Image,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  Send,
  Sheet,
  Slack,
  Split,
  Table2,
  Timer,
  Webhook,
  BookOpen,
  Smile
} from 'lucide-react';

const iconMap = {
  Webhook,
  CalendarClock,
  Hand,
  ClipboardList,
  Gem,
  Bot,
  BrainCircuit,
  Smile,
  Image,
  Mail,
  Slack,
  MessageSquare,
  Send,
  Phone,
  MessageCircle,
  Globe,
  Code2,
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
