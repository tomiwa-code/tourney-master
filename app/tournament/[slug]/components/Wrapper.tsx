"use client";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  checkGroupStageCompletion,
  cn,
  drawKnockoutRound,
  getQualifiers,
  getTournamentData,
} from "@/lib/utils";
import {
  CheckGroupStageCompletionRes,
  TournamentDataType,
} from "@/types/tournament.type";
import GroupStage from "./GroupStage";
import Link from "next/link";
import Fixtures from "./Fixtures";
import GoBack from "@/components/general/GoBack";
import { toast } from "sonner";
import KnockoutStage from "./KnockoutStage";
import { Dialog } from "@/components/ui/dialog";
import DrawKnockoutModal from "./DrawKnockoutModal";

const tabArr = ["groups", "fixtures", "knockout"];
const DynamicPageWrapper = ({ slug }: { slug: string }) => {
  const [activeTab, setActiveTab] = React.useState("groups");
  const [tournamentData, setTournamentData] =
    React.useState<TournamentDataType | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [openModal, setOpenModal] = React.useState(true);

  // CHECK GROUP STAGE COMPLETION
  const completionStatus: CheckGroupStageCompletionRes = React.useMemo(() => {
    if (!tournamentData)
      return {
        allCompleted: false,
        incompleteGroups: [],
        incompleteMatches: [],
      };

    return checkGroupStageCompletion(tournamentData);
  }, [tournamentData]);

  // GENERATE KNOCKOUT
  const generateKnockout = React.useCallback(() => {
    if (!tournamentData) {
      toast.error("Tournament data not found");
      return;
    }

    if (!completionStatus.allCompleted) {
      toast.error("Not all group matches are completed");
      return;
    }

    if (tournamentData.status !== "group-stage") {
      toast.error("Tournament is not in group stage");
      return;
    }

    const qualifiers = getQualifiers(
      tournamentData.groupStandings,
      tournamentData.numOfQualifier
    );

    try {
      const knockoutDrawn = drawKnockoutRound(qualifiers, 2);
      if (!knockoutDrawn) {
        toast.error("Failed to draw knockout round");
        return;
      }

      if (knockoutDrawn.length === 0) {
        toast.error("No matches drawn for knockout round");
        return;
      }

      const isRoundOf32 = knockoutDrawn.length === 16;
      const isRoundOf16 = knockoutDrawn.length === 8;
      const isQuarterFinal = knockoutDrawn.length === 4;
      const isSemiFinal = knockoutDrawn.length === 2;

      const updatedTournamentData: TournamentDataType = {
        ...tournamentData,
        knockoutStages: {
          roundOf32: isRoundOf32 ? knockoutDrawn : [],
          roundOf16: isRoundOf16 ? knockoutDrawn : [],
          quarterFinals: isQuarterFinal ? knockoutDrawn : [],
          semiFinals: isSemiFinal ? knockoutDrawn : [],
          finals: [],
        },
        status: "knockout",
        knockoutDrawn: true,
      };

      localStorage.setItem(
        `tourney-master-${slug}`,
        JSON.stringify(updatedTournamentData)
      );

      toast.success("Knockout round drawn successfully");
      setTournamentData(updatedTournamentData);
      setActiveTab("knockout");
    } catch (err) {
      toast.error(`${err}`);
    }
  }, [tournamentData, completionStatus, slug]);

  // FETCH TOURNAMENT DATA
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
    <div className="w-full min-h-screen flex-col flex items-center justify-center bg-white dark:bg-dark pt-20 md:pt-10 pb-20 px-5 md:px-10 lg:px-0">
      <GoBack />

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
          <div className="flex items-center flex-col justify-center mt-10">
            <h2 className="text-white text-center text-lg md:text-2xl font-semibold uppercase">
              {tournamentData.name} {activeTab === "groups" && "group stage"}{" "}
              tournament {activeTab === "fixtures" && "fixtures"}{" "}
              {activeTab === "knockout" && "knockout stage"}
            </h2>

            <div className="mt-14">
              {activeTab === "groups" && (
                <>
                  <div className="grid gap-y-10 lg:grid-cols-2 gap-x-10">
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

                  {completionStatus.allCompleted &&
                    !tournamentData.knockoutDrawn && (
                      <div className="w-full flex items-center justify-center mt-10">
                        <Button
                          onClick={() => setOpenModal(true)}
                          className="capitalize bg-dark-300 h-12 px-5 hover:bg-dark-400 duration-300 text-white font-medium"
                        >
                          draw knockout
                        </Button>
                      </div>
                    )}

                  {!completionStatus.allCompleted && (
                    <div className="w-full max-w-xl mx-auto mt-10">
                      <p className="text-gray-500 text-center mt-5">
                        Please note: if all groups matches are not completed
                        yet, the knockout stage cannot be drawn.
                      </p>
                      {completionStatus.incompleteGroups.length > 0 && (
                        <p className="text-gray-400 text-center mt-2">
                          Incomplete Groups:{" "}
                          {completionStatus.incompleteGroups.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              {activeTab === "fixtures" && (
                <div className="grid gap-y-10 lg:grid-cols-2 gap-x-16">
                  {Object.entries(tournamentData.groupFixtures).map(
                    ([group, teams]) => {
                      return (
                        <Fixtures
                          key={group}
                          group={group}
                          slug={slug}
                          teams={teams}
                          isKnockoutRound={tournamentData.knockoutDrawn}
                        />
                      );
                    }
                  )}
                </div>
              )}

              {activeTab === "knockout" && (
                <>
                  {!tournamentData.knockoutDrawn ? (
                    <div className="w-full max-w-sm h-[300px] flex items-center justify-center flex-col gap-y-3 mt-10">
                      <h2 className="text-white text-xl md:text-2xl font-semibold">
                        Knockout stage not available.
                      </h2>

                      <p className="text-gray-400 text-center text-sm">
                        The knockout stage is not available yet. Please complete
                        the group stage and draw the knockout round.
                      </p>
                    </div>
                  ) : (
                    <KnockoutStage
                      knockoutStages={tournamentData.knockoutStages}
                      slug={slug}
                      tournamentData={tournamentData}
                      setTournamentData={setTournamentData}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        )
      )}

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DrawKnockoutModal
          onClose={() => setOpenModal(false)}
          drawKnockout={generateKnockout}
        />
      </Dialog>
    </div>
  );
};

export default DynamicPageWrapper;
