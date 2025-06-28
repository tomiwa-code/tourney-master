"use client";
import React from "react";

import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

const GoBack = () => {
  const router = useRouter();

  return (
    <div className="absolute md:fixed top-8 md:top-10 left-5 md:left-20 flex items-center gap-x-4">
      <Button
        variant={"outline"}
        className="bg-transparent text-white"
        onClick={() => router.back()}
      >
        <ArrowLeft />
      </Button>

      <Link href={"/"}>
        <Button variant={"outline"} className="bg-transparent text-white">
          <Home />
        </Button>
      </Link>
    </div>
  );
};

export default GoBack;
