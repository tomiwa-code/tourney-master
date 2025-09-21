import React from "react";
import Image from "next/image";
import images from "@/constants/images";
import {
  KnockoutMatch,
  KnockoutStages,
  MatchResultsType,
  RoundsType,
} from "@/types/tournament.type";
import BracketRound from "./BracketRound";
import { cn } from "@/lib/utils";

interface BracketConnectionsProps {
  matchResults: MatchResultsType;
  KnockoutStages: KnockoutStages;
  knockoutStatus: boolean;
  getWinner: (
    round: RoundsType,
    matchId: string,
    currentRound: KnockoutMatch
  ) => KnockoutMatch;
  handleScoreChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    matchId: string,
    isHome: boolean,
    leg: "first" | "second"
  ) => void;
}

const BracketConnections = ({
  handleScoreChange,
  getWinner,
  KnockoutStages,
  knockoutStatus,
  matchResults,
}: BracketConnectionsProps) => {
  const { quarterFinals, semiFinals, finals, roundOf16, roundOf32 } =
    KnockoutStages;
  const tournamentWinner =
    finals !== undefined && finals[0]?.winner ? finals[0].winner : "";

  const isRoundOf32 = roundOf32 && roundOf32.length > 0;
  const isQuarterFinal =
    !isRoundOf32 && roundOf16.length === 0 && quarterFinals.length > 0;

  return (
    <>
      {isRoundOf32 && (
        <BracketRound
          matchResults={matchResults}
          currentRound={roundOf16}
          getWinner={getWinner}
          handleScoreChange={handleScoreChange}
          previousRound={roundOf32}
          previousRoundType={"roundOf32"}
          bracketLength={16}
          isDisabled={knockoutStatus}
        />
      )}

      <BracketRound
        matchResults={matchResults}
        currentRound={quarterFinals}
        getWinner={getWinner}
        handleScoreChange={handleScoreChange}
        previousRound={roundOf16}
        previousRoundType={"roundOf16"}
        className={isRoundOf32 ? "ml-[60] py-16" : ""}
        bracketLineClass={
          isRoundOf32 ? "h-[185px]" : isQuarterFinal ? "h-[53px]" : ""
        }
        bracketLength={8}
        isDisabled={knockoutStatus}
      />

      <BracketRound
        matchResults={matchResults}
        currentRound={semiFinals}
        getWinner={getWinner}
        handleScoreChange={handleScoreChange}
        previousRound={quarterFinals}
        previousRoundType={"quarterFinals"}
        bracketLength={4}
        className={`ml-[60] ${
          isRoundOf32
            ? "pt-[150px] pb-[155px]"
            : isQuarterFinal
            ? "py-12 -my-1"
            : "py-16"
        }`}
        bracketLineClass={
          isRoundOf32 ? "h-[360px]" : isQuarterFinal ? "h-[100px]" : "h-[185px]"
        }
        isDisabled={knockoutStatus}
      />

      <BracketRound
        matchResults={matchResults}
        currentRound={finals}
        getWinner={getWinner}
        handleScoreChange={handleScoreChange}
        previousRound={semiFinals}
        previousRoundType={"semiFinals"}
        bracketLength={2}
        className={`ml-[60] ${
          isRoundOf32
            ? "pt-[325px] pb-[330px]"
            : isQuarterFinal
            ? "py-20 my-3"
            : "pt-[150px] pb-[155px]"
        }`}
        bracketLineClass={
          isRoundOf32
            ? "h-[710px]"
            : isQuarterFinal
            ? "h-[195px]"
            : "h-[355px] bottom-4"
        }
        isDisabled={knockoutStatus}
        isFinal
      />

      <WinnerCard winner={tournamentWinner} className={isRoundOf32 ? "mt-2" : isQuarterFinal ? "mt-3" : ""} />
    </>
  );
};

export default BracketConnections;

// Winner card component
const WinnerCard = ({
  winner,
  className,
}: {
  winner: string;
  className?: string;
}) => (
  <div
    className={cn(
      "relative flex items-center ml-14 justify-center pb-3",
      className
    )}
  >
    <div className="relative">
      <div className="absolute -top-8">
        <h2 className="uppercase font-extrabold text-primary text-lg">
          winner
        </h2>
      </div>

      <div className="justify-start md:px-2 md:min-w-[150px] h-8 flex items-center bg-white">
        <p className="text-dark font-extrabold text-base text-nowrap">
          {winner}
        </p>
      </div>

      <div className="absolute overflow-hidden size-16 md:size-40 -right-[90px] -bottom-14">
        <Image
          src={images.trophy}
          alt="trophy"
          width={1000}
          height={1000}
          className="object-contain"
        />
      </div>
    </div>
  </div>
);
