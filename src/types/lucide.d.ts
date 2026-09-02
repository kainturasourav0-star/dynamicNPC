declare module "lucide-react" {
  import type { SVGProps, ForwardRefExoticComponent, RefAttributes } from "react";
  
  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    className?: string;
    [key: string]: any;
  }
  
  export type LucideIcon = ForwardRefExoticComponent<
    LucideProps & RefAttributes<SVGSVGElement>
  >;

  export const Activity: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const BookOpen: LucideIcon;
  export const Bot: LucideIcon;
  export const Check: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Clipboard: LucideIcon;
  export const Code: LucideIcon;
  export const Coins: LucideIcon;
  export const Copy: LucideIcon;
  export const Cpu: LucideIcon;
  export const Edit2: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const FolderGit2: LucideIcon;
  export const Gamepad2: LucideIcon;
  export const Globe: LucideIcon;
  export const Key: LucideIcon;
  export const Layers: LucideIcon;
  export const LayoutDashboard: LucideIcon;
  export const LogOut: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const Mic: LucideIcon;
  export const Play: LucideIcon;
  export const Plus: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const Send: LucideIcon;
  export const Settings: LucideIcon;
  export const Shield: LucideIcon;
  export const ShieldAlert: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Square: LucideIcon;
  export const Terminal: LucideIcon;
  export const Trash2: LucideIcon;
  export const UserPlus: LucideIcon;
  export const Volume2: LucideIcon;
  export const Wallet: LucideIcon;
  export const X: LucideIcon;
  export const Zap: LucideIcon;

  export const icons: Record<string, LucideIcon>;
  const defaultExport: Record<string, LucideIcon>;
  export default defaultExport;
}
