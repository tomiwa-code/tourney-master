"use client";
import { TournamentDataType } from "@/types/tournament.type";
import React from "react";

interface TournamentContextType {
  tournaments: TournamentDataType[];
  setTournaments: React.Dispatch<React.SetStateAction<TournamentDataType[]>>;
  originalTournamentList: TournamentDataType[];
  setOriginalTournamentList: React.Dispatch<
    React.SetStateAction<TournamentDataType[]>
  >;
}

const TournamentContext = React.createContext<
  TournamentContextType | undefined
>(undefined);

export const useTournaments = () => {
  const context = React.useContext(TournamentContext);
  if (!context) {
    throw new Error("useTournaments must be used within a TournamentProvider");
  }
  return context;
};

export const TournamentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [originalTournamentList, setOriginalTournamentList] = React.useState<
    TournamentDataType[]
  >([]);
  const [tournaments, setTournaments] = React.useState<TournamentDataType[]>(
    []
  );

  return (
    <TournamentContext.Provider
      value={{
        tournaments,
        setTournaments,
        originalTournamentList,
        setOriginalTournamentList,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};
