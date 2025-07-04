"use client";
import React from "react";

import { getTournamentData, updateMatchScore } from "@/lib/utils";
import { MatchFixture } from "@/types/tournament.type";
import { toast } from "sonner";
import FixtureCard from "./FixtureCard";

const Fixtures = ({
  group,
  teams,
  slug,
  isKnockoutRound = false,
}: {
  group: string;
  teams: MatchFixture[];
  slug: string;
  isKnockoutRound: boolean;
}) => {
  const [matchResults, setMatchResults] = React.useState<{
    [key: string]: {
      homeScore: number | null;
      awayScore: number | null;
      groupName: string;
      matchIndex: number;
    };
  }>({});
  const [isEditing, setIsEditing] = React.useState<string[]>([]);

  const handleScoreChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    groupName: string,
    matchIndex: number,
    isHome: boolean
  ) => {
    const { value } = e.target;
    const score = value === "" ? null : Math.max(0, parseInt(value, 10));

    setIsEditing((prev) => [...prev, `${groupName}-${matchIndex}`]);

    setMatchResults((prev) => ({
      ...prev,
      [`${groupName}-${matchIndex}`]: {
        homeScore: isHome
          ? score
          : prev[`${groupName}-${matchIndex}`]
          ? prev[`${groupName}-${matchIndex}`].homeScore
          : null,
        awayScore: !isHome
          ? score
          : prev[`${groupName}-${matchIndex}`]
          ? prev[`${groupName}-${matchIndex}`].awayScore
          : null,
        groupName,
        matchIndex,
      },
    }));
  };

  const handleScoreSubmit = React.useCallback(
    (
      groupName: string,
      matchIndex: number,
      scores: [number | null, number | null]
    ) => {
      const currentTournament = getTournamentData(slug);
      if (!currentTournament) return;

      const updatedTournament = updateMatchScore(
        currentTournament,
        groupName,
        matchIndex,
        scores[0],
        scores[1]
      );

      localStorage.setItem(
        `tourney-master-${slug}`,
        JSON.stringify(updatedTournament)
      );

      toast.success("Match results saved!");
    },
    [slug]
  );

  React.useEffect(() => {
    const initialResults = teams.reduce(
      (acc, team, idx) => {
        acc[`${group}-${idx}`] = {
          homeScore: team.result.homeScore,
          awayScore: team.result.awayScore,
          groupName: group,
          matchIndex: idx,
        };
        return acc;
      },
      {} as {
        [key: string]: {
          homeScore: number | null;
          awayScore: number | null;
          groupName: string;
          matchIndex: number;
        };
      }
    );

    setMatchResults(initialResults);
  }, [group, teams]);

  React.useEffect(() => {
    Object.entries(matchResults).forEach(([key, result]) => {
      const [groupName, matchIndex] = key.split("-");
      if (
        result.homeScore !== null &&
        result.awayScore !== null &&
        isEditing.includes(key)
      ) {
        handleScoreSubmit(groupName, parseInt(matchIndex, 10), [
          result.homeScore,
          result.awayScore,
        ]);
        setIsEditing((prev) => prev.filter((id) => id !== key));
      } else if (
        result.homeScore === null &&
        result.awayScore === null &&
        isEditing.includes(key)
      ) {
        handleScoreSubmit(groupName, parseInt(matchIndex, 10), [
          result.homeScore,
          result.awayScore,
        ]);
      }
    });
  }, [matchResults, isEditing, handleScoreSubmit]);

  return (
    <div className="flex flex-col gap-y-5" key={group}>
      <h2 className="uppercase text-xl text-center lg:text-left font-semibold text-white">
        group {group}
      </h2>

      <div className="flex-col flex items-center gap-y-2">
        {teams.map((team, idx) => (
          <div key={`${group}-${idx}`} className="flex items-center gap-x-4">
            <FixtureCard
              team={team.players[0]}
              score={matchResults[`${group}-${idx}`]?.homeScore ?? null}
              onScoreChange={(e) => handleScoreChange(e, group, idx, true)}
              disabled={isKnockoutRound}
            />

            <div className="w-9 h-full bg-white flex items-center justify-center">
              <p className="text-dark font-extrabold uppercase text-base leading-[16px]">
                vs
              </p>
            </div>

            <FixtureCard
              team={team.players[1]}
              score={matchResults[`${group}-${idx}`]?.awayScore ?? null}
              className="flex-row-reverse"
              onScoreChange={(e) => handleScoreChange(e, group, idx, false)}
              disabled={isKnockoutRound}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Fixtures;
