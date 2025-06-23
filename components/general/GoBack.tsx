"use client";
import React from "react";

import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const GoBack = () => {
  const router = useRouter();

  return (
    <div className="fixed top-10 left-20">
      <Button
        variant={"outline"}
        className="bg-transparent text-white"
        onClick={() => router.back()}
      >
        <ArrowLeft />
      </Button>
    </div>
  );
};

export default GoBack;
