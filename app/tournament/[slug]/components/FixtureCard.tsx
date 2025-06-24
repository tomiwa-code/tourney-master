"use client";

import { cn, truncateText } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface FixtureCardProps {
  groupName: string;
  matchIndex: number;
  team: string;
  score?: number | null;
  isHome?: boolean;
  className?: string;
  homeAway?: boolean;
  scores?: number[];
  single?: boolean;
  onScoreChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    groupName: string,
    matchIndex: number,
    isHome: boolean
  ) => void;
}

const FixtureCard = ({
  team,
  score,
  className,
  onScoreChange,
  isHome = false,
  groupName,
  matchIndex,
  homeAway = false,
  scores,
  single = false,
}: FixtureCardProps) => {
  const isMobile = window.innerWidth < 768;

  return (
    <div className={cn("flex items-center gap-x-2", className)}>
      <div
        className={cn(
          "px-10 md:px-0 truncate w-[110px] md:min-w-[180px] h-8 flex items-center justify-center bg-white",
          (homeAway || single) &&
            "justify-start md:pl-2 md:min-w-[150px] md:w-full"
        )}
      >
        <p
          className={cn(
            "text-dark font-extrabold text-sm",
            homeAway && "text-xs"
          )}
        >
          {isMobile ? truncateText(team, 8) : team}
        </p>
      </div>

      {!homeAway && !single && (
        <Input
          type="number"
          className="text-red font-extrabold text-center focus:bg-white border-0 outline-0 ring-0 focus:outline-0 !text-2xl px-0 rounded-none w-8 md:w-10 h-8 flex items-center justify-center bg-primary"
          value={score !== null ? score : ""}
          onChange={(e) => onScoreChange(e, groupName, matchIndex, isHome)}
        />
      )}

      {homeAway && (
        <div className="flex items-center gap-x-2">
          {[0, 1].map((item) => (
            <Input
              key={item}
              type="number"
              className="text-red font-extrabold text-center focus:bg-white border-0 outline-0 ring-0 focus:outline-0 !text-2xl px-0 rounded-none w-8 md:w-8 h-8 flex items-center justify-center bg-primary"
              value={!scores ? "" : scores[item]}
              onChange={() => {}}
            />
          ))}
        </div>
      )}

      {single && (
        <Input
          type="number"
          className="text-red font-extrabold text-center focus:bg-white border-0 outline-0 ring-0 focus:outline-0 !text-2xl px-0 rounded-none w-8 md:w-8 h-8 flex items-center justify-center bg-primary"
          value={score !== null ? score : ""}
          onChange={() => {}}
        />
      )}
    </div>
  );
};

export default FixtureCard;
