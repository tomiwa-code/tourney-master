import React from "react";
import FixtureCard from "./FixtureCard";
import Image from "next/image";
import images from "@/constants/images";

const data = [
  {
    playerOne: "TINO",
    playerTwo: "Mattys",
    home: [1, 2],
    away: [0, 1],
  },
  {
    playerOne: "NúmeroCinco",
    playerTwo: "OMALE",
    home: [1, 2],
    away: [0, 1],
  },
  {
    playerOne: "LuthaKingJnr",
    playerTwo: "Ultimate Tee",
    home: [1, 2],
    away: [0, 3],
  },
  {
    playerOne: "UltraDre",
    playerTwo: "LUHYAN-TOP-DAWG",
    home: [1, 2],
    away: [0, 1],
  },
  {
    playerOne: "TINO",
    playerTwo: "Mattys",
    home: [1, 2],
    away: [1, 1],
  },
  {
    playerOne: "NúmeroCinco",
    playerTwo: "OMALE",
    home: [1, 2],
    away: [0, 1],
  },
  {
    playerOne: "LuthaKingJnr",
    playerTwo: "Ultimate Tee",
    home: [1, 2],
    away: [0, 1],
  },
  {
    playerOne: "UltraDre",
    playerTwo: "Split22",
    home: [1, 2],
    away: [0, 1],
  },
];
const roundsOf16 = [...data];

const KnockoutStage = () => {
  const isRoundOf16 = roundsOf16.length === 8;

  return (
    <div
      className={`flex items-center gap-x-3 w-full  ${
        !isRoundOf16 ? "-ml-[90%]" : "-ml-[80%]"
      }`}
    >
      <div className="flex flex-col gap-y-4">
        {roundsOf16.map((match, idx) => {
          const home = match.home.reduce((prev, curr) => prev + curr, 0);
          const away = match.away.reduce((prev, curr) => prev + curr, 0);
          const winner = home > away ? "playerOne" : "playerTwo";

          const drawLine = isRoundOf16
            ? idx === 7 || idx === 3
            : idx === 3 || idx === 7 || idx === 11 || idx === 15;
          const drawSecondLine = isRoundOf16
            ? idx === 7
            : idx === 7 || idx === 15;

          return (
            <div className="flex items-center gap-x-2" key={idx}>
              <div className="flex flex-col gap-y-2">
                <FixtureCard
                  team={match.playerOne}
                  groupName={"A"}
                  matchIndex={0}
                  onScoreChange={() => {}}
                  homeAway
                />

                <FixtureCard
                  team={match.playerTwo}
                  groupName={"B"}
                  matchIndex={0}
                  onScoreChange={() => {}}
                  homeAway
                />
              </div>

              <div className="flex items-center relative">
                <div className="border-white border-y-[3px] border-r-[3px] h-10 w-5" />

                <div className="flex items-center gap-x-2">
                  <div className="w-4 border-white border-2" />

                  <div className="flex items-center gap-x-2">
                    <FixtureCard
                      team={match[winner]}
                      groupName={"B"}
                      matchIndex={0}
                      onScoreChange={() => {}}
                      homeAway
                    />

                    {idx % 2 !== 0 && (
                      <div className="border-white border-y-[3px] border-r-[3px] h-[90px] w-5 absolute -right-8 bottom-5 flex items-center justify-center">
                        <div className="absolute left-5 flex items-center gap-x-2">
                          <div className="w-4 border-white border-2" />

                          <div className="flex items-center gap-x-2">
                            <FixtureCard
                              team={match[winner]}
                              groupName={"B"}
                              matchIndex={0}
                              onScoreChange={() => {}}
                              homeAway
                            />

                            {idx % 2 !== 0 && drawLine && (
                              <div className="border-white border-y-[3px] border-r-[3px] h-[180px] w-5 absolute -right-8 bottom-4 flex items-center justify-center">
                                <div className="absolute left-5 flex items-center gap-x-2">
                                  <div className="w-4 border-white border-2" />

                                  <FixtureCard
                                    team={match[winner]}
                                    groupName={"B"}
                                    matchIndex={0}
                                    homeAway={isRoundOf16 ? false : true}
                                    onScoreChange={() => {}}
                                  />

                                  {idx % 2 !== 0 && drawSecondLine && (
                                    <div className="border-white border-y-[3px] border-r-[3px] h-[360px] w-5 absolute -right-8 bottom-3 flex items-center justify-center">
                                      <div className="absolute left-5 flex items-center gap-x-2">
                                        <div className="w-4 border-white border-2" />

                                        {!isRoundOf16 && (
                                          <div className="flex items-center gap-x-2">
                                            <FixtureCard
                                              team={match[winner]}
                                              groupName={"B"}
                                              matchIndex={0}
                                              single
                                              onScoreChange={() => {}}
                                            />

                                            {idx % 2 !== 0 && idx === 15 && (
                                              <div className="border-white border-y-[3px] border-r-[3px] h-[710px] w-5 absolute -right-8 bottom-3 flex items-center justify-center">
                                                <div className="absolute left-5 flex items-center gap-x-2">
                                                  <div className="w-4 border-white border-2" />
                                                  <WinnerCard
                                                    winner={match[winner]}
                                                  />
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {isRoundOf16 && (
                                          <WinnerCard winner={match[winner]} />
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KnockoutStage;

const WinnerCard = ({ winner }: { winner: string }) => {
  return (
    <div className="relative flex items-center">
      <div className="absolute -top-8">
        <h2 className="uppercase font-extrabold text-primary text-lg">
          winner
        </h2>
      </div>

      <div
        className={
          "justify-start md:px-2 md:min-w-[150px] h-8 flex items-center bg-white"
        }
      >
        <p className={"text-dark font-extrabold text-base text-nowrap"}>
          {winner}
        </p>
      </div>

      <div className="absolute overflow-hidden size-16 md:size-40 -right-24">
        <Image src={images.trophy} alt="trophy" width={1000} height={1000} />
      </div>
    </div>
  );
};
