"use client";
import React from "react";

import CreateLabel from "./CreateLabel";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { CreateTournamentFormDataType } from "@/types/tournament.type";
import { Input } from "@/components/ui/input";

interface CreateGroupStageProps {
  formData: CreateTournamentFormDataType;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSelectChange: (key: string, value: string) => void;
}

const radioOptions = ["random", "custom"];

const CreateGroupStage = ({
  formData,
  handleChange,
  handleSelectChange,
}: CreateGroupStageProps) => {
  return (
    <>
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
            min="1"
            className="uppercase appearance-none border-dark-300 h-12 md:h-14 text-white placeholder:text-gray-300 px-5"
          />
        </div>
      </div>

      <div className="flex flex-col gap-y-4 w-full ">
        <CreateLabel text="player distribution" />
        <RadioGroup
          value={formData.distribution}
          onValueChange={(value) => handleSelectChange("distribution", value)}
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

      {formData.distribution === "random" && (
        <div className="w-full flex flex-col gap-y-2">
          <CreateLabel className="normal-case" text="Player names" />
          <Textarea
            name="playerNames"
            value={formData.playerNames}
            onChange={handleChange}
            className="resize-none h-44 border-dark-300 text-white placeholder:text-gray-300 px-5"
            placeholder={`John\nJane\nMike\nSarah\nTom\nAlex`}
          />
        </div>
      )}

      {formData.distribution === "custom" && (
        <div className="w-full flex flex-col gap-y-2">
          <CreateLabel
            className="normal-case"
            text="Differentiate each group with the symbol asterisk (*) after the first group is listed"
          />
          <Textarea
            name="playerInput"
            value={formData.playerInput}
            onChange={handleChange}
            className="resize-none h-44 border-dark-300 text-white placeholder:text-gray-300 px-5 text-sm"
            placeholder={`John\nJane\nMike\n*\nAlice\nBob\nCharlie`}
          />
        </div>
      )}
    </>
  );
};

export default CreateGroupStage;
