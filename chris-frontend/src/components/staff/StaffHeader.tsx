import type React from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface StaffHeaderProps {
  onRefresh: () => void;
  loading: boolean;
}

const StaffHeader: React.FC<StaffHeaderProps> = ({ onRefresh, loading }) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-3xl font-bold text-white">Staff Panel</h2>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="text-white border-stone-800 hover:bg-stone-950/60"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default StaffHeader;
