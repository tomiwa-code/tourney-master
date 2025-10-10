"use client";
import React from "react";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { restoreFixtures } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PasteFixturesScoreModalProps {
  onClose: () => void;
  slug: string;
}
const PasteFixturesScoreModal = ({
  onClose,
  slug,
}: PasteFixturesScoreModalProps) => {
  const [pastedData, setPastedData] = React.useState("");
  const router = useRouter();

  const replaceFixtures = () => {
    if (restoreFixtures(slug, pastedData)) {
      toast.success("Fixtures and scores restored successfully.");
      onClose();
      router.refresh();
    } else {
      toast.error(
        "Failed to restore fixtures and scores. Please check the data format."
      );
    }
  };

  return (
    <DialogContent className="w-full mx-auto !max-w-2xl">
      <DialogHeader>
        <DialogTitle>Are you absolutely sure?</DialogTitle>
        <DialogDescription className="text-gray-700">
          This action will replace the fixtures and the scores, please ensure
          you have the correct data and Group stage that tallies with the copied
          data.
        </DialogDescription>

        <Textarea
          className="h-24 md:h-44 resize-none my-3 w-full max-w-xl mx-auto"
          value={pastedData}
          onChange={(e) => setPastedData(e.target.value)}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="h-12 w-28">
            Cancel
          </Button>
          <Button
            className="capitalize bg-dark-300 h-12 px-5 hover:bg-dark-400 duration-300 text-white font-medium"
            onClick={replaceFixtures}
          >
            Restore fixture score
          </Button>
        </DialogFooter>
      </DialogHeader>
    </DialogContent>
  );
};

export default PasteFixturesScoreModal;
