"use client";
import React from "react";

const isDark = true;
const MotherWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className={`${isDark ? "dark" : ""}`}>{children}</div>;
};

export default MotherWrapper;
