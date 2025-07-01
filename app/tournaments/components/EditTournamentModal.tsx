"use client";
import React from "react";

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TournamentDataType } from "@/types/tournament.type";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import EditGroup from "./EditGroup";
import EditDescription from "./EditDescription";
import EditKnockout from "./EditKnockout";

interface EditTournamentModalProps {
  activeTournamentData: TournamentDataType;
  onClose: () => void;
  setActiveTournamentData: React.Dispatch<
    React.SetStateAction<TournamentDataType | null>
  >;
}

const EditTournamentModal = ({
  activeTournamentData,
  onClose,
  setActiveTournamentData,
}: EditTournamentModalProps) => {
  const { slug, name, groups, status } = activeTournamentData;

  const [activeEdit, setActiveEdit] = React.useState<"group" | "knockout">(
    "group"
  );

  return (
    <DialogContent className="w-full mx-auto !max-w-2xl bg-dark-300 outline-0 border-0 min-h-[55vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="capitalize text-white">
          Editing {name}
        </DialogTitle>
        <DialogDescription className="text-gray-300 capitalize grid grid-cols-3 gap-4 mt-2">
          <EditDescription tournamentData={activeTournamentData} />
        </DialogDescription>

        {activeEdit === "group" && (
          <>
            {status !== "group-stage" ? (
              <div className="flex flex-col gap-y-2 min-h-40 mt-14 w-full items-center justify-center max-w-lg mx-auto">
                <h2 className="text-gray-300 font-medium text-lg">
                  Group stage edit not available
                </h2>

                <p className="text-gray-400 text-sm text-center">
                  This tournament is currently in the {status} stage and cannot
                  be edited. Group stage edits are only available during the
                  group stage.
                </p>
              </div>
            ) : (
              <EditGroup
                groups={groups}
                slug={slug}
                setActiveTournament={setActiveTournamentData}
              />
            )}
          </>
        )}

        {activeEdit === "knockout" && (
          <>
            {status !== "knockout" ? (
              <div className="flex flex-col gap-y-2 min-h-40 mt-14 w-full items-center justify-center max-w-lg mx-auto">
                <h2 className="text-gray-300 font-medium text-lg">
                  Knockout stage edit not available
                </h2>

                <p className="text-gray-400 text-sm text-center">
                  This tournament is {status} and cannot be edited. Knockout
                  stage edits are only available during the knockout stage.
                </p>
              </div>
            ) : (
              <EditKnockout
                tournamentData={activeTournamentData}
                onClose={onClose}
              />
            )}
          </>
        )}
      </DialogHeader>

      <DialogFooter className="gap-x-8">
        {activeEdit !== "group" ? (
          <Button
            variant={"ghost"}
            onClick={() => setActiveEdit("group")}
            className="capitalize h-12 w-28 font-medium text-gray-400"
          >
            <Pencil />
            edit group
          </Button>
        ) : (
          <Button
            variant={"ghost"}
            onClick={() => setActiveEdit("knockout")}
            className="capitalize h-12 w-28 font-medium text-gray-400"
          >
            <Pencil />
            edit knockout
          </Button>
        )}

        <Button
          onClick={onClose}
          className="capitalize bg-white h-12 w-28 hover:bg-dark-400 duration-300 hover:text-white font-medium"
        >
          close
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default EditTournamentModal;
