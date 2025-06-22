"use client";
import React from "react";

import images from "@/constants/images";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const initial = {
  y: 30,
  opacity: 0,
};
const animate = {
  y: 0,
  opacity: 1,
};

const LandingPageWrapper = () => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 2500); // Simulate loading delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-white dark:bg-dark">
      <div className="w-full flex-col max-w-3xl flex items-center justify-center min-h-32">
        <div className="relative overflow-hidden size-44">
          <Image src={images.trophy} alt="trophy" width={1000} height={1000} />
        </div>

        <div className="mt-3 flex flex-col gap-y-1 items-center justify-center">
          <p className="text-2xl font-medium capitalize text-white">
            Welcome to,
          </p>
          <h2 className="text-4xl uppercase font-semibold text-primary tracking-tighter">
            tourney master
          </h2>

          <p className="text-base font-normal text-center text-gray-500 dark:text-gray-300 mt-1">
            Your ultimate tournament management tool
          </p>
        </div>

        <AnimatePresence mode="popLayout">
          {isLoaded && (
            <motion.div
              initial={initial}
              animate={animate}
              transition={{
                duration: 0.4,
                ease: "easeInOut",
              }}
              className="flex items-center justify-center gap-x-5 mt-5"
            >
              <Link href={"/create"}>
                <Button className="capitalize bg-dark-300 h-12 px-5 hover:bg-dark-400 duration-300 text-white">
                  Create New Tournament
                </Button>
              </Link>

              <Link href={"/tournaments"}>
                <Button
                  variant={"outline"}
                  className="h-12 bg-transparent border-dark-300 text-white duration-300 hover:bg-dark-300/20 "
                >
                  View Tournaments
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LandingPageWrapper;
