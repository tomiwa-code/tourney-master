import React from "react";
import TournamentsPageWrapper from "./components/Wrapper";
import { TournamentProvider } from "@/context/Tournament.context";

const ListTournamentsPage = () => {
  return (
    <TournamentProvider>
      <TournamentsPageWrapper />
    </TournamentProvider>
  );
};

export default ListTournamentsPage;
