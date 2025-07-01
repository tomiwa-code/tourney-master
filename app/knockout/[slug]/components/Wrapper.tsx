"use client";
import KnockoutStage from "@/app/tournament/[slug]/components/KnockoutStage";
import GoBack from "@/components/general/GoBack";
import { Button } from "@/components/ui/button";
import { getTournamentData } from "@/lib/utils";
import { TournamentDataType } from "@/types/tournament.type";
import Link from "next/link";
import React from "react";

const SoloKnockoutWrapper = ({ slug }: { slug: string }) => {
  const [tournamentData, setTournamentData] =
    React.useState<TournamentDataType | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const tournamentData = getTournamentData(slug);
    if (tournamentData) {
      setIsLoading(false);
      setTournamentData(tournamentData);
    } else {
      setIsLoading(false);
      setTournamentData(null);
    }
  }, [slug]);

  return (
    <div className="w-full min-h-screen flex-col flex items-center justify-center bg-white dark:bg-dark pt-20 md:pt-10 pb-20 px-5 md:px-10 lg:px-0">
      <GoBack />

      {isLoading && !tournamentData ? (
        <div className="w-full max-w-sm h-80 flex items-center justify-center mt-10">
          <div className="size-20 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
        </div>
      ) : !tournamentData ? (
        <div className="w-full max-w-sm h-[300px] flex items-center justify-center flex-col gap-y-3 mt-10">
          <h2 className="text-white text-xl md:text-2xl font-semibold">
            Tournament not found.
          </h2>

          <p className="text-gray-400 text-center text-sm">
            The tournament you are looking for does not exist or has been
            deleted.
          </p>

          <Link href={"/create"}>
            <Button className="capitalize bg-dark-300 h-12 px-5 hover:bg-dark-400 duration-300 text-white mt-5">
              <span>create a new tournament</span>
            </Button>
          </Link>
        </div>
      ) : (
        tournamentData && (
          <div className="flex flex-col gap-y-10 mt-10">
            <h2 className="text-primary text-center text-lg md:text-2xl font-semibold uppercase">
              {tournamentData.name} knockout stage
            </h2>

            <KnockoutStage
              knockoutStages={tournamentData.knockoutStages}
              slug={slug}
              tournamentData={tournamentData}
              setTournamentData={setTournamentData}
            />
          </div>
        )
      )}
    </div>
  );
};

export default SoloKnockoutWrapper;
