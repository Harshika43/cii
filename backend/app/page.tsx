"use client";
import { useEffect } from "react";
import { useAssessment }       from "@/hooks/useAssessment";
import { LandingScreen }       from "@/components/landing/LandingScreen";
import { UserAuthScreen }      from "@/components/auth/UserAuthScreen";
import { UserHistoryDashboard } from "@/components/dashboard/UserHistoryDashboard";
import { OrgAdminScreen }      from "@/components/org/OrgAdminScreen";
import { OrgEmployeeJoin }     from "@/components/org/OrgEmployeeJoin";
import { UserDetailsForm }     from "@/components/forms/UserDetailsForm";
import { SectionIntro }        from "@/components/assessment/SectionIntro";
import { QuestionScreen }      from "@/components/assessment/QuestionScreen";
import { AnalyzingScreen }     from "@/components/assessment/AnalyzingScreen";
import { IndividualResults }   from "@/components/dashboard/IndividualResults";
import { OrgDashboard }        from "@/components/org/OrgDashboard";

export default function CIIApp() {
  const {
    screen, setScreen,
    qi, q, sec, showIntro, setShowIntro,
    answers, setAnswer, canGo,
    results, aiData, setResults, setAiData,
    userInfo, userId, sessionId,
    orgContext,
    createdOrg, setCreatedOrg,
    adminOrg,   setAdminOrg,
    authUserId, authEmail,
    handleAuthNewUser, handleAuthReturning,
    handleOrgJoined, handleUserDetailsSubmit,
    next, back, retake, retakeFromHistory,
  } = useAssessment();

  // Handle ?invite= URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("invite")) setScreen("orgEmployee");
  }, [setScreen]);

  // ── Landing ──
  if (screen === "landing") return (
    <LandingScreen
      onIndividual={() => setScreen("userDetails")}
      onOrgAdmin={()    => setScreen("orgAdmin")}
      onOrgEmployee={() => setScreen("orgEmployee")}
    />
  );

  

  // ── Org Admin ──
  if (screen === "orgAdmin") return (
    <OrgAdminScreen
      onCreated={(org) => { setCreatedOrg(org); setScreen("orgAdminDash"); }}
      onLoggedIn={(org)=> { setAdminOrg(org);   setScreen("orgAdminDash"); }}
      onBack={() => setScreen("landing")}
    />
  );

  // ── Org Admin Dashboard ──
  if (screen === "orgAdminDash") {
    const org = (adminOrg || createdOrg) as any;
    return (
      <div style={{ minHeight: "100dvh", background: "#edeae4", display: "flex", flexDirection: "column" }}>
        <OrgDashboard
          orgId={org?.id}
          orgName={org?.name || "Your Org"}
          orgInviteCode={org?.invite_code}
          currentUserResult={null}
          onBack={() => { setAdminOrg(null); setCreatedOrg(null); setScreen("landing"); }}
        />
      </div>
    );
  }

  // ── Org Employee Join ──
  if (screen === "orgEmployee") return (
    <OrgEmployeeJoin
      prefillCode={typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("invite") || "" : ""}
      onJoined={handleOrgJoined}
      onBack={() => setScreen("landing")}
    />
  );

  // ── User Details ──
  if (screen === "userDetails") return (
    <UserDetailsForm
      onSubmit={handleUserDetailsSubmit}
      orgContext={orgContext}
      prefillEmail={authEmail || undefined}
    />
  );

  // ── Analyzing ──
  if (screen === "analyzing") return <AnalyzingScreen />;

  // ── Results ──
  if (screen === "results" && results) return (
    <IndividualResults
      results={results}
      aiData={aiData}
      userInfo={userInfo}
      userId={userId}
      sessionId={sessionId}
      onRetake={retake}
      onBack={undefined}
      orgContext={orgContext}
    />
  );

  // ── Test Flow ──
  if (screen === "test") {
    if (showIntro && sec) return <SectionIntro sec={sec} onGo={() => setShowIntro(false)} />;
    if (q) return (
      <QuestionScreen
        q={q} qi={qi} total={25}
        answers={answers} setAnswer={setAnswer}
        onNext={next} onBack={back} canGo={canGo}
      />
    );
  }

  return null;
}