"use client";
import React from "react";

import { Input } from "@/components/ui/input";
import CreateLabel from "./CreateLabel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TourneyMasterLogo from "@/components/general/TourneyMasterLogo";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  createTournamentValidateInput,
  validatePlayerNames,
} from "@/lib/validation";
import {
  distributePlayers,
  generateGroupFixtures,
  initializeStandings,
} from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DistributionMethod } from "@/types/tournament.type";
import GoBack from "@/components/general/GoBack";

const radioOptions = ["random", "custom"];

const CreateWrapper = () => {
  const [formData, setFormData] = React.useState({
    tournamentName: "monarchs",
    gameType: "group",
    maxPlayers: "28",
    playersPerGroup: "7",
    playerNames: "",
    playerInput: "",
    qualifier: "4",
    distribution: "random", // 'random' or 'custom'
  });

  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      gameType: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const {
      tournamentName,
      maxPlayers,
      playersPerGroup,
      playerNames,
      distribution,
      playerInput,
    } = formData;

    const isCustomDistribution = distribution === "custom";

    if (
      !createTournamentValidateInput({
        tournamentName,
        maxPlayers,
        playersPerGroup,
        playerNames: isCustomDistribution ? playerInput : playerNames,
      })
    )
      return;

    const playerNamesArray = playerNames
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name);

    const players = playerInput
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (!isCustomDistribution) {
      if (!validatePlayerNames(playerNamesArray, Number(maxPlayers))) return;
    }

    if (isCustomDistribution) {
      if (!validatePlayerNames(players, Number(maxPlayers))) return;
    }

    try {
      const groups = distributePlayers(
        isCustomDistribution ? players : playerNamesArray,
        Number(playersPerGroup),
        distribution as DistributionMethod,
        isCustomDistribution ? playerInput : undefined
      );

      // GENERATE FIXTURES FOR EACH GROUP
      const groupFixtures = generateGroupFixtures(groups);

      // INITIALIZE STANDINGS FOR EACH GROUP
      const groupStandings = initializeStandings(groups);

      // Generate a unique slug
      const slug = `${tournamentName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")}-${Math.random().toString(36).substring(2, 8)}`;

      const tournamentData = {
        slug,
        name: tournamentName.trim(),
        numOfQualifier: Number(formData.qualifier),
        groups,
        groupFixtures,
        groupStandings,
        distribution,
        totalPlayer: maxPlayers,
        playersPerGroup,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "group-stage", // can be 'group-stage', 'knockout', 'completed'
      };

      // Save to localStorage
      localStorage.setItem(
        `tourney-master-${slug}`,
        JSON.stringify(tournamentData)
      );

      toast.success("Tournament created successfully!");
      router.push(`/tournament/${slug}`);
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  return (
    <div className="w-full min-h-screen flex-col flex items-center justify-center bg-white dark:bg-dark pt-20 md:pt-10 pb-20">
      <GoBack />
      <TourneyMasterLogo />

      <form
        onSubmit={handleSubmit}
        className="w-full px-5 md:px-0 mt-8 flex-col max-w-xl gap-y-6 flex items-center justify-center min-h-32"
      >
        <div className="w-full flex flex-col gap-y-2">
          <CreateLabel text="tournament name" />
          <Input
            name="tournamentName"
            value={formData.tournamentName}
            onChange={handleChange}
            className="uppercase border-dark-300 h-12 md:h-14 text-white placeholder:text-gray-300 px-5 font-medium text-base md:!text-lg"
            placeholder="tournament name"
          />
        </div>

        <div className="w-full flex flex-col gap-y-2">
          <CreateLabel text="pick a game type" />
          <Select value={formData.gameType} onValueChange={handleSelectChange}>
            <SelectTrigger className="w-full capitalize border-dark-300 !h-12 md:!h-14 text-white placeholder:text-gray-300 px-5">
              <SelectValue placeholder="Game Type" />
            </SelectTrigger>
            <SelectContent className="bg-dark-300 text-white border-0">
              <SelectItem value="group">Group</SelectItem>
              <SelectItem value="knockout">Knockout</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-col gap-y-6 md:flex-row flex items-center gap-x-3 w-full">
          <div className="w-full md:flex-1 flex flex-col gap-y-2">
            <CreateLabel text="max players" />
            <Input
              name="maxPlayers"
              value={formData.maxPlayers}
              onChange={handleChange}
              type="number"
              min="2"
              className="uppercase appearance-none border-dark-300 h-12 md:h-14 text-white placeholder:text-gray-300 px-5"
            />
          </div>

          <div className="w-full md:flex-1 flex flex-col gap-y-2">
            <CreateLabel text="players per group" />
            <Input
              name="playersPerGroup"
              value={formData.playersPerGroup}
              onChange={handleChange}
              type="number"
              min="2"
              className="uppercase appearance-none border-dark-300 h-12 md:h-14 text-white placeholder:text-gray-300 px-5"
            />
          </div>
        </div>

        <div className="flex items-center gap-x-3 w-full">
          <div className="flex-1 flex flex-col gap-y-2">
            <CreateLabel text="number of qualifiers" />
            <Input
              name="qualifier"
              value={formData.qualifier}
              onChange={handleChange}
              type="number"
              min="2"
              className="uppercase appearance-none border-dark-300 h-12 md:h-14 text-white placeholder:text-gray-300 px-5"
            />
          </div>
        </div>

        <div className="flex flex-col gap-y-4 w-full ">
          <CreateLabel text="player distribution" />
          <RadioGroup
            value={formData.distribution}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, distribution: value }))
            }
            className="flex items-center gap-x-4"
          >
            {radioOptions.map((option, idx) => (
              <div className="flex items-center space-x-2" key={idx}>
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option} className="text-gray-300 capitalize">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {formData.distribution === "custom" && (
          <div className="w-full flex flex-col gap-y-2">
            <CreateLabel text="separate player names by comma, group by *" />
            <Textarea
              name="playerInput"
              value={formData.playerInput}
              onChange={handleChange}
              className="resize-none h-44 border-dark-300 text-white placeholder:text-gray-300 px-5 text-sm"
              placeholder="John, Jane, Mike, * Sarah, Tom, Alex, * etc."
            />
          </div>
        )}

        {formData.distribution === "random" && (
          <div className="w-full flex flex-col gap-y-2">
            <CreateLabel text="player names (separated by comma)" />
            <Textarea
              name="playerNames"
              value={formData.playerNames}
              onChange={handleChange}
              className="resize-none h-44 border-dark-300 text-white placeholder:text-gray-300 px-5"
              placeholder="John, Jane, Mike, Sarah..."
            />
          </div>
        )}

        <div className="flex items-center justify-center">
          <Button
            type="submit"
            className="capitalize bg-dark-300 h-12 px-5 hover:bg-dark-400 duration-300 text-white"
          >
            Create Tournament
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateWrapper;
