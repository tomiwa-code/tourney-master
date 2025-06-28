"use client";
import React from "react";

import TourneyMasterLogo from "@/components/general/TourneyMasterLogo";
import { toast } from "sonner";
import {
  createTournamentValidateInput,
  validatePlayerNames,
} from "@/lib/validation";
import {
  distributePlayers,
  generateGroupFixtures,
  initializeStandings,
  splitPlayerNames,
  validateTournamentSetup,
} from "@/lib/utils";
import { useRouter } from "next/navigation";

import {
  CreateTournamentFormDataType,
  DistributionMethod,
} from "@/types/tournament.type";
import GoBack from "@/components/general/GoBack";
import CreateForm from "./CreateForm";

const CreateWrapper = () => {
  const [formData, setFormData] = React.useState<CreateTournamentFormDataType>({
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

  const handleSelectChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
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
      qualifier,
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

    const playerNamesArray = splitPlayerNames(playerNames);
    const players = splitPlayerNames(playerInput);

    if (!isCustomDistribution) {
      if (!validatePlayerNames(playerNamesArray, Number(maxPlayers))) return;
    }

    if (isCustomDistribution) {
      if (!validatePlayerNames(players, Number(maxPlayers), true)) return;
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

      // VALIDATE TOURNAMENT SETUP
      const isValidSetup = validateTournamentSetup(
        groupStandings,
        Number(qualifier)
      );

      if (!isValidSetup.isValid) {
        toast.error(isValidSetup.message || "Invalid tournament setup", {
          duration: 8000,
        });
        return;
      }

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

      <CreateForm
        formData={formData}
        setFormData={setFormData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSelectChange={handleSelectChange}
      />
    </div>
  );
};

export default CreateWrapper;
