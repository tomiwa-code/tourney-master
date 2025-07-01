"use client";
import React from "react";

import TourneyMasterLogo from "@/components/general/TourneyMasterLogo";
import { Button } from "@/components/ui/button";
import TableList from "./TableList";
import { TournamentDataType } from "@/types/tournament.type";
import { getAndSortTournaments } from "@/lib/utils";
import GoBack from "@/components/general/GoBack";
import Link from "next/link";
import { useTournaments } from "@/context/Tournament.context";

const itemsPerPage = 7;
const TournamentsPageWrapper = () => {
  const {
    originalTournamentList,
    setOriginalTournamentList,
    tournaments,
    setTournaments,
  } = useTournaments();
  const [page, setPage] = React.useState(1);

  const totalPages = React.useMemo(() => {
    const total = originalTournamentList.length / itemsPerPage;
    return Math.ceil(total);
  }, [originalTournamentList]);

  const updatePageData = (
    currentPage: number,
    originalData?: TournamentDataType[]
  ) => {
    const startAt = itemsPerPage * (currentPage - 1);
    const endAt = itemsPerPage * currentPage;
    const selectData = originalData ? originalData : originalTournamentList;

    const newData = selectData.slice(startAt, endAt);

    setTournaments(newData);
  };

  const handleNextPage = () => {
    setPage((prev) => {
      const nextPage = Math.min(prev + 1, totalPages);
      updatePageData(nextPage);

      return nextPage;
    });
  };

  const handlePrevPage = () => {
    setPage((prev) => {
      const prevPage = Math.min(prev - 1, 1);
      updatePageData(prevPage);

      return prevPage;
    });
  };

  React.useEffect(() => {
    const data = getAndSortTournaments("tourney-master-monarchs-");

    setOriginalTournamentList(data);
    updatePageData(1, data);
  }, []);

  return (
    <div className="w-full min-h-screen flex-col flex items-center justify-center bg-white dark:bg-dark px-5 md:px-10 lg:px-0">
      <GoBack />

      <TourneyMasterLogo />

      {tournaments.length === 0 && (
        <div className="w-full max-w-sm h-[300px] flex items-center justify-center flex-col gap-y-3 mt-10">
          <h2 className="text-white text-xl md:text-2xl font-semibold">
            No tournaments found.
          </h2>

          <p className="text-gray-400 text-center text-sm">
            There are no tournaments available at the moment. You can create a
            new tournament to get started.
          </p>

          <Link href={"/create"}>
            <Button className="capitalize bg-dark-300 h-12 px-5 hover:bg-dark-400 duration-300 text-white mt-5">
              <span>create a new tournament</span>
            </Button>
          </Link>
        </div>
      )}

      {tournaments.length > 0 && (
        <>
          <div className="relative mt-10">
            <h2 className="text-white text-base md:text-lg font-medium md:font-semibold uppercase">
              List of all tournaments
            </h2>
          </div>

          <div className="mt-10 py-5 px-6 w-full max-w-5xl h-[475px] bg-dark-300 rounded-2xl">
            <TableList startIdx={itemsPerPage * (page - 1)} />
          </div>

          <div className="w-full max-w-5xl mt-8 flex items-center justify-between">
            <p className="text-base font-medium text-gray-300">
              Page {page} <span className="text-primary">of</span> {totalPages}
            </p>

            <div className="flex items-center gap-x-4">
              <Button
                disabled={page == 1}
                onClick={handlePrevPage}
                className="w-24 bg-gray-300 capitalize text-dark font-medium"
              >
                Prev
              </Button>

              <Button
                onClick={handleNextPage}
                disabled={totalPages === page}
                className="w-24 bg-gray-300 capitalize text-dark font-medium hover:text-red duration-300"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TournamentsPageWrapper;
