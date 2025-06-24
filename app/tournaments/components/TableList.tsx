"use client";
import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TournamentDataType } from "@/types/tournament.type";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const tableHeadClass = "text-gray-300";
const cellStyle = "capitalize h-14";

interface TableListProps {
  tournaments: TournamentDataType[];
  startIdx: number;
}

const TableList = ({ tournaments, startIdx }: TableListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="uppercase text-gray-300">
          <TableHead className={`${tableHeadClass}`}>s/n</TableHead>
          <TableHead className={`${tableHeadClass}`}>id</TableHead>
          <TableHead className={`${tableHeadClass}`}>name</TableHead>
          <TableHead className={tableHeadClass}>status</TableHead>
          <TableHead className={tableHeadClass}>qualifier</TableHead>
          <TableHead className={tableHeadClass}>distribution</TableHead>
          <TableHead className={tableHeadClass}>groups</TableHead>
          <TableHead className={tableHeadClass}>players</TableHead>
          <TableHead className={tableHeadClass}>P. per group</TableHead>
          <TableHead className={tableHeadClass}>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tournaments.map((data, idx) => {
          const {
            name,
            slug,
            numOfQualifier,
            playersPerGroup,
            status,
            groups,
            distribution,
            totalPlayer,
          } = data;
          const id = slug.split("-")[1];

          return (
            <TableRow className="text-white" key={idx}>
              <TableCell className={`${cellStyle} text-gray-300`}>
                {idx + startIdx + 1}
              </TableCell>
              <TableCell className={`${cellStyle}`}>{id}</TableCell>
              <TableCell
                className={`${cellStyle} text-primary/90 font-medium hover:text-gray-400 duration-300`}
              >
                <Link href={`/tournament/${slug}`}>
                  {name.replaceAll("-", " ")}
                </Link>
              </TableCell>
              <TableCell className={`${cellStyle}`}>
                {status.replaceAll("-", " ")}
              </TableCell>
              <TableCell className={`${cellStyle}`}>
                {numOfQualifier ?? "null"}
              </TableCell>
              <TableCell className={`${cellStyle}`}>
                {distribution ?? "null"}
              </TableCell>
              <TableCell className={`${cellStyle}`}>
                {Object.values(groups).length}
              </TableCell>
              <TableCell className={`${cellStyle}`}>
                {totalPlayer ?? "null"}
              </TableCell>
              <TableCell className={`${cellStyle}`}>
                {playersPerGroup ?? "null"}
              </TableCell>
              <TableCell className={`${cellStyle} flex items-center gap-x-2`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="bg-white text-dark rounded-lg hover:bg-white"
                      size={"icon"}
                    >
                      <Pencil />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit tournament</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="bg-red text-white rounded-lg hover:bg-red"
                      size={"icon"}
                    >
                      <Trash />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete tournament</p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default TableList;
