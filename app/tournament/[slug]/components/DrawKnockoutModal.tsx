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

interface DrawKnockoutModalProps {
  onClose: () => void;
  drawKnockout: () => void;
}

const DrawKnockoutModal = ({
  onClose,
  drawKnockout,
}: DrawKnockoutModalProps) => {
  return (
    <DialogContent className="w-full mx-auto !max-w-2xl">
      <DialogHeader>
        <DialogTitle>Are you absolutely sure?</DialogTitle>
        <DialogDescription className="text-gray-700">
          This action will generate the knockout stage for the tournament and
          it cannot be undone. please ensure all the group matches scores are
          entered correctly before proceeding. This will permanently change the
          tournament status to knockout stage.
        </DialogDescription>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="h-12 w-28">
            Cancel
          </Button>
          <Button
            className="capitalize bg-dark-300 h-12 px-5 hover:bg-dark-400 duration-300 text-white font-medium"
            onClick={drawKnockout}
          >
            Draw Knockout
          </Button>
        </DialogFooter>
      </DialogHeader>
    </DialogContent>
  );
};

export default DrawKnockoutModal;
