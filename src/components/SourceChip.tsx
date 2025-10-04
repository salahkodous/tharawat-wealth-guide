import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SourceChipProps {
  title: string;
  url: string;
  index?: number;
}

export const SourceChip = ({ title, url, index }: SourceChipProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Badge 
      variant="outline" 
      className="inline-flex items-center gap-1 cursor-pointer hover:bg-accent/50 transition-colors ml-1 align-middle"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      }}
    >
      {index !== undefined && <span className="text-[10px] font-bold">[{index}]</span>}
      <span className="text-xs max-w-[200px] truncate" title={title}>{title}</span>
      <ExternalLink className="h-3 w-3 flex-shrink-0" />
    </Badge>
  );
};
