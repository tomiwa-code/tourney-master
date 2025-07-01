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
import { CreateTournamentFormDataType } from "@/types/tournament.type";
import { Button } from "@/components/ui/button";
import CreateGroupStage from "./CreateGroupStage";
import CreateKnockout from "./CreateKnockout";

interface CreateFormProps {
  formData: CreateTournamentFormDataType;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleCreateKnockout: (e: React.FormEvent) => void;
  handleSelectChange: (key: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isDisabled: boolean;
}

const groupOptions = ["group", "knockout"];

const CreateForm = ({
  formData,
  handleChange,
  handleSubmit,
  handleCreateKnockout,
  handleSelectChange,
  isDisabled,
}: CreateFormProps) => {
  return (
    <form
      onSubmit={
        formData.gameType === "group" ? handleSubmit : handleCreateKnockout
      }
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
        <Select
          value={formData.gameType}
          onValueChange={(value) => handleSelectChange("gameType", value)}
        >
          <SelectTrigger className="w-full capitalize border-dark-300 !h-12 md:!h-14 text-white placeholder:text-gray-300 px-5">
            <SelectValue placeholder="Game Type" />
          </SelectTrigger>
          <SelectContent className="bg-dark-300 text-white border-0">
            {groupOptions.map((option) => (
              <SelectItem
                key={option}
                value={option}
                className="capitalize hover:bg-dark-400 cursor-pointer duration-300 py-4 px-2"
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.gameType === "group" && (
        <CreateGroupStage
          formData={formData}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
        />
      )}

      {formData.gameType === "knockout" && (
        <CreateKnockout
          formData={formData}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
        />
      )}

      <div className="flex items-center justify-center">
        {formData.gameType === "group" && (
          <Button
            type="submit"
            disabled={isDisabled}
            className="capitalize bg-dark-300 h-12 px-5 hover:bg-dark-400 duration-300 text-white"
          >
            Create Tournament
          </Button>
        )}

        {formData.gameType === "knockout" && (
          <Button
            type="submit"
            disabled={isDisabled}
            className="capitalize bg-dark-300 h-12 px-5 hover:bg-dark-400 duration-300 text-white"
          >
            Create Knockout Tournament
          </Button>
        )}
      </div>
    </form>
  );
};

export default CreateForm;
