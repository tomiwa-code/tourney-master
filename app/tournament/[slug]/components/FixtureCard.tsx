"use client";
import React from "react";

import { cn, truncateText } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface FixtureCardProps {
  team: string;
  score?: number | null;
  scores?: (number | null)[];
  className?: string;
  homeAway?: boolean;
  single?: boolean;
  disabled?: boolean;
  firstLegEnded?: boolean;
  onScoreChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    leg?: "first" | "second"
  ) => void;
}

const FixtureCard = ({
  team,
  score = null,
  scores = [null, null],
  className,
  homeAway = false,
  single = false,
  disabled = false,
  onScoreChange,
  firstLegEnded,
}: FixtureCardProps) => {
  const [isMobile, setIsMobile] = React.useState(false);

  // Truncate team name based on screen size
  const displayName =
    isMobile && team.length > 12 ? truncateText(team, 8) : team;

  // Responsive design with proper resize handling
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={cn(
        "flex items-center gap-x-2",
        homeAway && "min-w-[180px]",
        className
      )}
    >
      {/* Team name container */}
      <div
        className={cn(
          "min-w-[110px] md:w-[200px] h-8 flex items-center px-2 md:pl-3 bg-white overflow-hidden",
          homeAway && "justify-start",
          single && "justify-center"
        )}
      >
        <p
          className={cn(
            "text-dark font-extrabold text-sm md:text-base truncate",
            homeAway && "text-xs md:text-sm"
          )}
        >
          {displayName}
        </p>
      </div>

      {!homeAway && !single && (
        <GroupStageInput
          score={score}
          disabled={disabled}
          onChange={onScoreChange}
        />
      )}

      {homeAway && !single && (
        <KnockoutInputs
          scores={scores}
          disabled={disabled}
          onChange={onScoreChange}
          firstLegEnded={firstLegEnded ?? false}
        />
      )}

      {single && (
        <FinalInput
          score={scores[1]}
          disabled={disabled}
          onChange={onScoreChange}
        />
      )}
    </div>
  );
};

export default FixtureCard;

// Sub-components for different input types
const inputStyle = `
  text-red font-extrabold text-center
  focus:bg-white border-0 outline-0 ring-0
  focus:outline-0 !text-2xl px-0 rounded-none
  w-8 md:w-10 h-8 flex items-center justify-center bg-primary
`;

const GroupStageInput = ({
  score,
  disabled,
  onChange,
}: {
  score?: number | null;
  disabled: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <Input
    type="number"
    className={cn(inputStyle)}
    value={score !== null ? score : ""}
    disabled={disabled}
    onChange={onChange}
    min={0}
  />
);

const KnockoutInputs = ({
  scores,
  disabled,
  firstLegEnded,
  onChange,
}: {
  scores: (number | null)[];
  disabled: boolean;
  firstLegEnded: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    leg: "first" | "second"
  ) => void;
}) => (
  <div className="flex items-center gap-x-2">
    {scores.map((_, index) => (
      <Input
        key={index}
        type="number"
        className={cn(inputStyle, "md:w-8")}
        value={scores[index] !== null ? scores[index] : ""}
        disabled={
          disabled ? disabled : index === 1 && !firstLegEnded ? true : false
        }
        onChange={(e) => onChange(e, index === 0 ? "first" : "second")}
        min={0}
      />
    ))}
  </div>
);

const FinalInput = ({
  score,
  disabled,
  onChange,
}: {
  score?: number | null;
  disabled: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    leg: "first" | "second"
  ) => void;
}) => (
  <Input
    type="number"
    className={cn(inputStyle, "md:w-8")}
    value={score !== null ? score : ""}
    disabled={disabled}
    onChange={(e) => onChange(e, "second")}
    min={0}
  />
);
