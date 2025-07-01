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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import EditTournamentModal from "./EditTournamentModal";
import { useTournaments } from "@/context/Tournament.context";

const tableHeadClass = "text-gray-300";
const cellStyle = "capitalize h-14 text-center";

interface TableListProps {
  startIdx: number;
}

const TableList = ({ startIdx }: TableListProps) => {
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [aboutToDelete, setAboutToDelete] = React.useState<string | null>(null);
  const [openEditModal, setOpenEditModal] = React.useState(false);
  const [activeTournament, setActiveTournament] =
    React.useState<TournamentDataType | null>(null);
  const { setTournaments, setOriginalTournamentList, tournaments } =
    useTournaments();

  const handleDelete = (slug: string) => {
    localStorage.removeItem(`tourney-master-${slug}`);
    const updatedTournaments = tournaments.filter(
      (tournament) => tournament.slug !== slug
    );

    setOriginalTournamentList((prev) =>
      prev.filter((tournament) => tournament.slug !== slug)
    );
    setTournaments(updatedTournaments);
    setOpenDeleteModal(false);
    setAboutToDelete(null);
    toast.success(`Tournament ${slug} deleted successfully!`);
  };

  const handleEdit = (tournament: TournamentDataType) => {
    setActiveTournament(tournament);
    setOpenEditModal(true);
  };

  return (
    <>
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
                <TableCell className={`${cellStyle} text-gray-300 text-left`}>
                  {idx + startIdx + 1}
                </TableCell>
                <TableCell className={`${cellStyle} text-left`}>{id}</TableCell>
                <TableCell
                  className={`${cellStyle} text-primary/90 font-medium hover:text-gray-400 duration-300 text-left`}
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
                <TableCell
                  className={`${cellStyle} flex items-center justify-center gap-x-2`}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => handleEdit(data)}
                        className="bg-white text-dark rounded-lg hover:bg-gray-200"
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
                        onClick={() => {
                          setOpenDeleteModal(true);
                          setAboutToDelete(slug);
                        }}
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

      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription className="text-gray-700">
              You are about to delete{" "}
              <span className="font-semibold text-black capitalize">
                {aboutToDelete}
              </span>
              , this action cannot be undone. This will permanently delete your
              league and remove your data from our servers.
            </DialogDescription>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpenDeleteModal(false)}
                className="h-12 w-28"
              >
                Cancel
              </Button>
              <Button
                className="bg-red text-white hover:bg-red-600 h-12 w-28"
                onClick={() => handleDelete(aboutToDelete || "")}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {activeTournament && openEditModal && (
        <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
          <EditTournamentModal
            setActiveTournamentData={setActiveTournament}
            activeTournamentData={activeTournament}
            onClose={() => setOpenEditModal(false)}
          />
        </Dialog>
      )}
    </>
  );
};

export default TableList;
