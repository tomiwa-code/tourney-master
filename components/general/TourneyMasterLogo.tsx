import images from "@/constants/images";
import Image from "next/image";
import React from "react";

const TourneyMasterLogo = () => {
  return (
    <div className="relative flex items-center justify-center">
      <div className="relative overflow-hidden size-20">
        <Image src={images.trophy} alt="trophy" width={1000} height={1000} />
      </div>

      <div className="flex flex-col gap-y-1 items-center justify-center">
        <h2 className="text-2xl uppercase font-semibold text-primary tracking-tighter">
          tourney master
        </h2>
      </div>
    </div>
  );
};

export default TourneyMasterLogo;
