import React from "react";
import SoloKnockoutWrapper from "./components/Wrapper";

interface KnockoutPageProps {
  params: Promise<{ slug: string }>;
}

const KnockoutPage = async ({ params }: KnockoutPageProps) => {
  const { slug } = await params;

  return <SoloKnockoutWrapper slug={slug} />;
};

export default KnockoutPage;
