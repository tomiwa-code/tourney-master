import React from "react";
import FixtureCard from "./FixtureCard";
import {
  KnockoutMatch,
  MatchResultsType,
  RoundsType,
} from "@/types/tournament.type";
import { cn } from "@/lib/utils";

interface BracketRoundProps {
  matchResults: MatchResultsType;
  currentRound: KnockoutMatch[];
  previousRound: KnockoutMatch[];
  previousRoundType: RoundsType;
  getWinner: (
    round: RoundsType,
    matchId: string,
    currentRound: KnockoutMatch
  ) => KnockoutMatch;
  className?: string;
  bracketLineClass?: string;
  bracketLength: number;
  isFinal?: boolean;
  isDisabled: boolean;
  isRoundOf16?: boolean;
  handleScoreChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    matchId: string,
    isHome: boolean,
    leg: "first" | "second"
  ) => void;
}

const BracketRound = ({
  matchResults,
  currentRound,
  getWinner,
  handleScoreChange,
  previousRound,
  className,
  bracketLineClass,
  previousRoundType,
  bracketLength,
  isFinal,
  isDisabled,
  isRoundOf16 = false,
}: BracketRoundProps) => {
  const previousRoundIsEmpty = previousRound.length === 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-y-4 justify-between py-5",
        className,
        !isRoundOf16 && "h-[71vh]"
      )}
    >
      {Array.from({ length: bracketLength }).map((_, idx) => {
        const winnerMatch = getWinner(
          previousRoundType,
          previousRound?.length > 0 && previousRound[idx]
            ? previousRound[idx].id
            : "",
          currentRound[Math.floor(idx / 2)]
        );

        const currentRoundMatch = currentRound[Math.floor(idx / 2)];
        const isHome = idx % 2 === 0 ? true : false;
        const isAway = !isHome ? true : false;

        const teamName =
          previousRoundIsEmpty && isHome
            ? winnerMatch?.home ?? ""
            : previousRoundIsEmpty && isAway
            ? winnerMatch?.away ?? ""
            : winnerMatch?.winner ?? "";

        const scores = (currentRoundMatch !== undefined &&
          matchResults[currentRoundMatch.id] &&
          matchResults[currentRoundMatch.id]) || {
          homeScore: [null, null],
          awayScore: [null, null],
        };

        const firstLegEnded =
          scores.homeScore[0] !== null && scores.awayScore[0] !== null;

        return (
          <div className="relative" key={idx}>
            <FixtureCard
              key={idx}
              team={teamName}
              onScoreChange={(e, leg) =>
                handleScoreChange(
                  e,
                  currentRoundMatch?.id,
                  isHome,
                  leg ?? "first"
                )
              }
              scores={
                isHome
                  ? scores.homeScore
                  : isAway
                  ? scores.awayScore
                  : [null, null]
              }
              homeAway
              disabled={isDisabled || !teamName}
              firstLegEnded={firstLegEnded}
              single={isFinal}
            />

            {idx % 2 !== 0 && (
              <div
                className={cn(
                  "border-white border-y-[3px] border-r-[3px] h-[95px] w-5 absolute -right-8 bottom-[13px] flex items-center justify-center",
                  bracketLineClass
                )}
              >
                <div className="w-4 border-white border-2 absolute -right-7" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BracketRound;
