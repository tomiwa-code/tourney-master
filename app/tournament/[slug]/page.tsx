import React from "react";
import DynamicPageWrapper from "./components/Wrapper";

interface DynamicTournamentPageProps {
  params: Promise<{ slug: string }>;
}

const DynamicTournamentPage = async ({
  params,
}: DynamicTournamentPageProps) => {
  const { slug } = await params;

  return <DynamicPageWrapper slug={slug} />;
};

export default DynamicTournamentPage;
