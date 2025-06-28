"use client";
import { cn, getTournamentData, updateMatchInStorage } from "@/lib/utils";
import {
  KnockoutMatch,
  KnockoutStages,
  MatchResultsType,
  RoundsType,
  TournamentDataType,
} from "@/types/tournament.type";
import React from "react";
import DsFixtureCard from "./FixtureCard";
import { toast } from "sonner";
import BracketConnections from "./BracketConnections";

interface KnockoutStageProps {
  knockoutStages: KnockoutStages;
  slug: string;
  tournamentData: TournamentDataType;
  setTournamentData: React.Dispatch<
    React.SetStateAction<TournamentDataType | null>
  >;
}
const commonItem = {
  home: "",
  away: "",
  id: "",
  round: "",
  completed: false,
};

const KnockoutStage = ({
  knockoutStages,
  slug,
  setTournamentData,
  tournamentData,
}: KnockoutStageProps) => {
  const [matchResults, setMatchResults] = React.useState<MatchResultsType>({});
  const [editingMatchId, setEditingMatchId] = React.useState<{
    matchId: string;
    legStatus: "first" | "second";
  } | null>(null);

  // Check if the initial round is 32 or 16
  const isRoundOf16 = tournamentData.knockoutStages.roundOf32 ? false : true;

  // Extract rounds from knockout stages
  const { roundOf32, roundOf16, finals } = knockoutStages;

  // Check if final is played
  const tournamentWinner =
    finals !== undefined && finals[0]?.winner ? finals[0].winner : "";
  const disableScoreInput = tournamentWinner !== "" ? true : false;

  // Determine initial round based on props
  const initialRound = React.useMemo(() => {
    return isRoundOf16 ? roundOf16 : roundOf32 || [];
  }, [isRoundOf16, roundOf16, roundOf32]);

  // Handle score changes
  const handleScoreChange = React.useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      matchId: string,
      isHome: boolean,
      leg: "first" | "second"
    ) => {
      if (!matchId) return;
      const { value } = e.target;
      const score = value === "" ? null : Math.max(0, parseInt(value, 10));

      setEditingMatchId({
        matchId,
        legStatus: leg,
      });

      setMatchResults((prev) => {
        const currentMatch = prev[matchId] || {
          homeScore: [null, null],
          awayScore: [null, null],
        };

        const legIndex = leg === "first" ? 0 : 1;
        const scoreType = isHome ? "homeScore" : "awayScore";

        return {
          ...prev,
          [matchId]: {
            ...currentMatch,
            [scoreType]: currentMatch[scoreType].map((s, idx) =>
              idx === legIndex ? score : s
            ),
          },
        };
      });
    },
    []
  );

  // Save match results when editing is complete
  const saveMatchResults = React.useCallback(() => {
    if (!editingMatchId) return;

    const match = matchResults[editingMatchId.matchId];
    if (!match) return;

    const splitId = editingMatchId.matchId.split("-");
    const roundKey = splitId.includes("16")
      ? "roundOf16"
      : splitId.includes("32")
      ? "roundOf32"
      : splitId.includes("quarter") || splitId.includes("Quarter")
      ? "quarterFinals"
      : splitId.includes("semi") || splitId.includes("Semi")
      ? "semiFinals"
      : "finals";

    // Check if First leg scores are complete
    const isFirstLegComplete =
      match.homeScore[0] !== null && match.awayScore[0] !== null;
    const isSecondLegComplete =
      match.homeScore[1] !== null && match.awayScore[1] !== null;

    if (editingMatchId.legStatus === "first" && isFirstLegComplete) {
      try {
        // Update storage
        const updatedTournament = updateMatchInStorage({
          matchId: editingMatchId.matchId,
          roundKey: roundKey as RoundsType,
          slug,
          firstLeg: [
            match.homeScore[0] !== null ? match.homeScore[0] : 0,
            match.awayScore[0] !== null ? match.awayScore[0] : 0,
          ],
        });

        if (updatedTournament) {
          setTournamentData(updatedTournament);
        }

        setEditingMatchId(null);
        toast.success("First leg match results saved!");
      } catch (error) {
        toast.error(
          `Failed to save first leg match result: ${
            error instanceof Error ? error.message : error
          }`
        );
      }

      return;
    }

    if (editingMatchId.legStatus === "second" && isSecondLegComplete) {
      try {
        // Update storage
        const updatedTournament = updateMatchInStorage({
          matchId: editingMatchId.matchId,
          roundKey: roundKey as RoundsType,
          slug,
          secondLeg: [
            match.homeScore[1] !== null ? match.homeScore[1] : 0,
            match.awayScore[1] !== null ? match.awayScore[1] : 0,
          ],
        });

        if (updatedTournament) {
          setTournamentData(updatedTournament);
        }
        setEditingMatchId(null);
        toast.success("Second leg match results saved!");
      } catch (error) {
        toast.error(
          `Failed to save second leg match result: ${
            error instanceof Error ? error.message : error
          }`
        );
      }

      return;
    }
  }, [editingMatchId, matchResults, slug, setTournamentData]);

  // Get winner of a match based on round and match ID
  const getWinner = React.useCallback(
    (
      round: RoundsType,
      matchId: string,
      currentRound: KnockoutMatch
    ): KnockoutMatch => {
      const knockoutData = tournamentData.knockoutStages[round];

      if (knockoutData && knockoutData.length === 0) {
        return currentRound;
      }

      return knockoutData?.find((m) => m.id === matchId) ?? { ...commonItem };
    },
    [tournamentData]
  );

  // Load match results from localStorage
  const loadMatchResults = React.useCallback(() => {
    const currentTournament = getTournamentData(slug);
    if (!currentTournament) return;

    const knockoutData = currentTournament.knockoutStages;
    if (!knockoutData) return;

    const results: MatchResultsType = {};
    const roundOf32Matches = knockoutData.roundOf32 || [];
    const roundOf16Matches = knockoutData.roundOf16 || [];
    const quarterFinalMatches = knockoutData.quarterFinals || [];
    const semiFinalMatches = knockoutData.semiFinals || [];
    const finalMatches = knockoutData.finals || [];

    [
      ...roundOf32Matches,
      ...roundOf16Matches,
      ...quarterFinalMatches,
      ...semiFinalMatches,
      ...finalMatches,
    ].forEach((match) => {
      results[match.id] = {
        homeScore: match.homeScore || [null, null],
        awayScore: match.awayScore || [null, null],
      };
    });

    setMatchResults(results);
  }, [slug]);

  // Save results when editing completes
  React.useEffect(() => {
    if (editingMatchId) {
      saveMatchResults();
    }
  }, [editingMatchId, saveMatchResults]);

  // Load initial data
  React.useEffect(() => {
    loadMatchResults();
  }, [tournamentData, loadMatchResults]);

  return (
    <div className={cn("flex gap-x-3 w-full")}>
      <div className="flex flex-col gap-y-4">
        {initialRound.map((match, idx) => {
          const { home, away, id } = match;
          const scores = matchResults[id] || {
            homeScore: [null, null],
            awayScore: [null, null],
          };
          const firstLegEnded =
            scores.homeScore[0] !== null && scores.awayScore[0] !== null;

          return (
            <div className="flex items-center gap-x-2" key={idx}>
              <div className="flex flex-col gap-y-2">
                <DsFixtureCard
                  team={home ?? ""}
                  onScoreChange={(e, leg) =>
                    handleScoreChange(e, id, true, leg ?? "first")
                  }
                  scores={scores.homeScore}
                  firstLegEnded={firstLegEnded}
                  disabled={disableScoreInput}
                  homeAway
                />

                <DsFixtureCard
                  team={away ?? ""}
                  onScoreChange={(e, leg) =>
                    handleScoreChange(e, id, false, leg ?? "first")
                  }
                  scores={scores.awayScore}
                  firstLegEnded={firstLegEnded}
                  disabled={disableScoreInput}
                  homeAway
                />
              </div>

              <div className="border-white border-y-[3px] border-r-[3px] h-10 w-5" />
              <div className="w-4 border-white border-2" />
            </div>
          );
        })}
      </div>

      <BracketConnections
        matchResults={matchResults}
        handleScoreChange={handleScoreChange}
        KnockoutStages={knockoutStages}
        getWinner={getWinner}
        knockoutStatus={tournamentData.status === "completed"}
      />
    </div>
  );
};

export default KnockoutStage;
