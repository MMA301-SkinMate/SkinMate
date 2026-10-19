import React from 'react';
import * as LucideIcons from 'lucide-react';

export const Icon = ({ name, size = 20, color = '#1e293b', style, strokeWidth = 2 }) => {
  // Map common names to Lucide icons
  const iconMap = {
    home: LucideIcons.Home,
    bell: LucideIcons.Bell,
    check: LucideIcons.Check,
    'check-circle': LucideIcons.CheckCircle2,
    circle: LucideIcons.Circle,
    smile: LucideIcons.Smile,
    flame: LucideIcons.Flame,
    'alert-triangle': LucideIcons.AlertTriangle,
    'circle-dot': LucideIcons.CircleDot,
    droplets: LucideIcons.Droplets,
    sun: LucideIcons.Sun,
    moon: LucideIcons.Moon,
    calendar: LucideIcons.Calendar,
    clock: LucideIcons.Clock,
    info: LucideIcons.Info,
    'chevron-right': LucideIcons.ChevronRight,
    'chevron-left': LucideIcons.ChevronLeft,
    'arrow-left': LucideIcons.ArrowLeft,
    plus: LucideIcons.Plus,
    edit: LucideIcons.Edit3,
    trash: LucideIcons.Trash2,
    undo: LucideIcons.Undo2,
    refresh: LucideIcons.RefreshCw,
    x: LucideIcons.X,
    sparkles: LucideIcons.Sparkles,
    heart: LucideIcons.Heart,
    share: LucideIcons.Share2,
    shield: LucideIcons.ShieldCheck,
    book: LucideIcons.BookOpen,
    layers: LucideIcons.Layers,
    sliders: LucideIcons.SlidersHorizontal,
    grid: LucideIcons.LayoutGrid,
    package: LucideIcons.Package,
    checkin: LucideIcons.ClipboardCheck,
    zap: LucideIcons.Zap,
    eye: LucideIcons.Eye,
  };

  const IconComponent = iconMap[name] || LucideIcons[name] || LucideIcons.CircleHelp;

  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} style={style} />;
};
