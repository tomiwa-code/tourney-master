"use client";
import React from "react";

import { Button } from "@/components/ui/button";
import { cn, getTournamentData } from "@/lib/utils";
import { TournamentDataType } from "@/types/tournament.type";
import GroupStage from "./GroupStage";
import Link from "next/link";
import Fixtures from "./Fixtures";

const tabArr = ["groups", "fixtures", "knockout"];
const DynamicPageWrapper = ({ slug }: { slug: string }) => {
  const [activeTab, setActiveTab] = React.useState("groups");
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
  }, [slug, activeTab]);

  return (
    <div className="w-full min-h-screen flex-col flex items-center justify-center bg-white dark:bg-dark pt-10 pb-20">
      <div className="flex items-center justify-center gap-x-4 bg-dark-300 px-3 py-3 rounded-2xl">
        {tabArr.map((tab, idx) => (
          <Button
            className={cn(
              "capitalize text-gray-200 duration-300 ease-in-out",
              activeTab === tab && "bg-primary text-red font-medium"
            )}
            variant={activeTab === tab ? "default" : "ghost"}
            onClick={() => setActiveTab(tab)}
            key={idx}
          >
            <span>{tab}</span>
          </Button>
        ))}
      </div>

      {isLoading && !tournamentData ? (
        <div className="w-full max-w-sm h-80 flex items-center justify-center mt-10">
          <div className="size-20 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
        </div>
      ) : !tournamentData ? (
        <div className="w-full max-w-sm h-[300px] flex items-center justify-center flex-col gap-y-3 mt-10">
          <h2 className="text-white text-2xl font-semibold">
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
          <div className="flex items-center flex-col justify-center mt-10">
            <h2 className="text-white text-2xl font-semibold uppercase">
              {tournamentData.name} {activeTab === "groups" && "group stage"}{" "}
              tournament {activeTab === "fixtures" && "fixtures"}{" "}
              {activeTab === "knockout" && "knockout stage"}
            </h2>

            <div className="mt-14">
              {activeTab === "groups" && (
                <div className="grid gap-y-10 grid-cols-2 gap-x-10">
                  {Object.entries(tournamentData.groups).map(
                    ([group, teams]) => {
                      return (
                        <GroupStage
                          key={group}
                          group={group}
                          teams={teams}
                          tournamentData={tournamentData}
                        />
                      );
                    }
                  )}
                </div>
              )}

              {activeTab === "fixtures" && (
                <div className="grid gap-y-10 grid-cols-2 gap-x-16">
                  {Object.entries(tournamentData.groupFixtures).map(
                    ([group, teams]) => {
                      return (
                        <Fixtures
                          key={group}
                          group={group}
                          slug={slug}
                          teams={teams}
                        />
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default DynamicPageWrapper;
