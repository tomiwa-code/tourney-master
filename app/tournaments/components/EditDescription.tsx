import { TournamentDataType } from "@/types/tournament.type";
import React from "react";

interface EditDescriptionProps {
  tournamentData: TournamentDataType;
}

const valueStyle = "font-medium text-gray-300";
const labelStyle = "text-gray-400 text-sm";
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
      <span className={`${labelStyle}`}>
        id: <span className={`${valueStyle}`}>{slug.split("-")[1]}</span>
      </span>

      <span className={`${labelStyle}`}>
        name: <span className={`${valueStyle}`}>{name}</span>
      </span>

      <span className={`${labelStyle}`}>
        distribution: <span className={`${valueStyle}`}>{distribution}</span>
      </span>

      <span className={`${labelStyle}`}>
        status: <span className={`${valueStyle}`}>{status}</span>
      </span>

      <span className={`${labelStyle}`}>
        groups:{" "}
        <span className={`${valueStyle}`}>
          {groups ? Object.values(groups).length : 0}
        </span>
      </span>

      <span className={`${labelStyle}`}>
        players per group:{" "}
        <span className={`${valueStyle}`}>{playersPerGroup}</span>
      </span>

      <span className={`${labelStyle}`}>
        total players: <span className={`${valueStyle}`}>{totalPlayer}</span>
      </span>

      <span className={`${labelStyle}`}>
        qualifiers: <span className={`${valueStyle}`}>{numOfQualifier}</span>
      </span>
    </>
  );
};

export default EditDescription;
