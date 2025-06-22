import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { TournamentDataType } from "@/types/tournament.type";

interface GroupStageProps {
  group: string;
  teams: string[];
  tournamentData: TournamentDataType;
}

const tableHeadClass = "text-gray-300";
const qualifier = 4;

const GroupStage = ({ group, teams, tournamentData }: GroupStageProps) => {
  const getTeamStats = (group: string, teamName: string) => {
    const findTeam = tournamentData?.groupStandings[group].find(
      (team) => team.player === teamName
    );

    return findTeam;
  };

  return (
    <div className="bg-dark-300 rounded-lg p-5 min-w-[200px] flex flex-col gap-y-3">
      <h3 className="text-xl font-semibold text-primary uppercase text-center">
        Group {group}
      </h3>

      <Table>
        <TableHeader>
          <TableRow className="uppercase text-gray-300">
            <TableHead className={`${tableHeadClass}`}>s/n</TableHead>
            <TableHead className={`w-[200px] pl-4 ${tableHeadClass}`}>
              team
            </TableHead>
            <TableHead className={tableHeadClass}>mp</TableHead>
            <TableHead className={tableHeadClass}>w</TableHead>
            <TableHead className={tableHeadClass}>d</TableHead>
            <TableHead className={tableHeadClass}>l</TableHead>
            <TableHead className={tableHeadClass}>gf</TableHead>
            <TableHead className={tableHeadClass}>ga</TableHead>
            <TableHead className={tableHeadClass}>gd</TableHead>
            <TableHead className={`${tableHeadClass} font-medium text-white`}>
              pts
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team, idx) => {
            const stats = getTeamStats(group, team)!;
            const { mp, w, d, l, gf, ga, gd, pts } = stats;

            return (
              <TableRow key={idx} className="text-white">
                <TableCell
                  className={cn(
                    "font-medium bg-emerald-600 text-center text-white",
                    idx + 1 > qualifier && "bg-red"
                  )}
                >
                  {idx + 1}
                </TableCell>
                <TableCell className="pl-4">{team}</TableCell>
                <TableCell className="text-center">{mp ?? 0}</TableCell>
                <TableCell className="text-center">{w ?? 0}</TableCell>
                <TableCell className="text-center">{d ?? 0}</TableCell>
                <TableCell className="text-center">{l ?? 0}</TableCell>
                <TableCell className="text-center">{gf ?? 0}</TableCell>
                <TableCell className="text-center">{ga ?? 0}</TableCell>
                <TableCell className="text-center">{gd ?? 0}</TableCell>
                <TableCell className="text-primary text-center font-medium">
                  {pts}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default GroupStage;
