"use client";
import React from "react";

import CreateLabel from "./CreateLabel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreateTournamentFormDataType } from "@/types/tournament.type";

interface CreateKnockoutProps {
  formData: CreateTournamentFormDataType;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSelectChange: (key: string, value: string) => void;
}

const roundsArr = [
  {
    label: "round of 32",
    value: "round-of-32",
  },
  {
    label: "round of 16",
    value: "round-of-16",
  },
  {
    label: "quarter finals",
    value: "quarter-finals",
  },
];

const CreateKnockout = ({
  formData,
  handleChange,
  handleSelectChange,
}: CreateKnockoutProps) => {
  const numOfPlayers = React.useMemo(() => {
    switch (formData.knockoutType) {
      case "round-of-32":
        return 32;
      case "round-of-16":
        return 16;
      case "quarter-finals":
        return 8;
      default:
        return 0;
    }
  }, [formData.knockoutType]);

  return (
    <>
      <div className="w-full flex flex-col gap-y-2">
        <CreateLabel text="rounds" />
        <Select
          value={formData.knockoutType}
          onValueChange={(value) => handleSelectChange("knockoutType", value)}
        >
          <SelectTrigger className="w-full capitalize border-dark-300 !h-12 md:!h-14 text-white placeholder:text-gray-300 px-5">
            <SelectValue placeholder="round of 16" />
          </SelectTrigger>
          <SelectContent className="bg-dark-300 text-white border-0">
            {roundsArr.map((round) => (
              <SelectItem
                key={round.value}
                value={round.value.toString()}
                className="capitalize hover:bg-dark-400 cursor-pointer duration-300 py-4 px-2"
              >
                {round.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full flex flex-col gap-y-2">
        <CreateLabel
          className="normal-case"
          text={`Enter (${numOfPlayers}) player names`}
        />
        <Textarea
          name="knockoutPlayerNames"
          value={formData.knockoutPlayerNames}
          onChange={handleChange}
          className="resize-none h-44 border-dark-300 text-white placeholder:text-gray-300 px-5"
          placeholder={`John\nJane\nMike\nSarah\nTom\nAlex`}
        />
      </div>
    </>
  );
};

export default CreateKnockout;
