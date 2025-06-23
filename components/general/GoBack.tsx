"use client";
import React from "react";

import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const GoBack = () => {
  const router = useRouter();

  return (
    <div className="absolute md:fixed top-8 md:top-10 left-5 md:left-20">
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
