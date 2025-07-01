import { TournamentDataType } from "@/types/tournament.type";
import React from "react";

interface EditDescriptionProps {
  tournamentData: TournamentDataType;
}

const EditDescription = ({ tournamentData }: EditDescriptionProps) => {
  const {
    slug,
    name,
    distribution,
    status,
    groups,
    playersPerGroup,
    totalPlayer,
    numOfQualifier,
  } = tournamentData;

  return (
    <>
      <span>
        id: <span className="font-semibold">{slug.split("-")[1]}</span>
      </span>

      <span>
        name: <span className="font-semibold">{name}</span>
      </span>

      <span>
        distribution: <span className="font-semibold">{distribution}</span>
      </span>

      <span>
        status: <span className="font-semibold">{status}</span>
      </span>

      <span>
        groups:{" "}
        <span className="font-semibold">{Object.values(groups).length}</span>
      </span>

      <span>
        players per group:{" "}
        <span className="font-semibold">{playersPerGroup}</span>
      </span>

      <span>
        total players: <span className="font-semibold">{totalPlayer}</span>
      </span>

      <span>
        qualifiers: <span className="font-semibold">{numOfQualifier}</span>
      </span>
    </>
  );
};

export default EditDescription;
