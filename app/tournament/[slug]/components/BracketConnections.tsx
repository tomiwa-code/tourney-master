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

interface BracketConnectionsProps {
  matchResults: MatchResultsType;
  KnockoutStages: KnockoutStages;
  getWinner: (round: RoundsType, matchId: string) => KnockoutMatch;
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
  matchResults,
}: BracketConnectionsProps) => {
  const { quarterFinals, semiFinals, finals, roundOf16 } = KnockoutStages;
  const tournamentWinner =
    finals !== undefined && finals[0]?.winner ? finals[0].winner : "";
  const disableScoreInput = tournamentWinner !== "" ? true : false;

  return (
    <>
      <BracketRound
        matchResults={matchResults}
        currentRound={quarterFinals}
        getWinner={getWinner}
        handleScoreChange={handleScoreChange}
        previousRound={roundOf16}
        previousRoundType={"roundOf16"}
        bracketLength={8}
        isDisabled={disableScoreInput}
      />

      <BracketRound
        matchResults={matchResults}
        currentRound={semiFinals}
        getWinner={getWinner}
        handleScoreChange={handleScoreChange}
        previousRound={quarterFinals}
        previousRoundType={"quarterFinals"}
        bracketLength={4}
        className="ml-[60] py-16"
        bracketLineClass="h-[185px]"
        isDisabled={disableScoreInput}
      />

      <BracketRound
        matchResults={matchResults}
        currentRound={finals}
        getWinner={getWinner}
        handleScoreChange={handleScoreChange}
        previousRound={semiFinals}
        previousRoundType={"semiFinals"}
        bracketLength={2}
        className="ml-[60] pt-[150px] pb-[155px]"
        bracketLineClass="h-[355px] bottom-4"
        isDisabled={disableScoreInput}
        isFinal
      />

      <WinnerCard winner={tournamentWinner} />
    </>
  );
};

export default BracketConnections;

// Winner card component
const WinnerCard = ({ winner }: { winner: string }) => (
  <div className="relative flex items-center ml-14 justify-center pb-3">
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
