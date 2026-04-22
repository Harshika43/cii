"use client";
import { useState, useRef, useMemo, useCallback } from "react";
import { Qs } from "@/constants/questions";
import { SECS } from "@/constants/sections";
import { computeScore } from "@/lib/utils/scoring";
import { scoreWithAI } from "@/lib/ai/scorer";
import { dbUpsertUser } from "@/lib/db/users";
import { dbCreateSession } from "@/lib/db/sessions";
import { dbSaveAnswers, dbSaveResults } from "@/lib/db/results";
import { genId } from "@/lib/utils/helpers";
import type { UserInfo } from "@/types/user";
import type { AssessmentResults, AIData, Answers } from "@/types/assessment";
import type { OrgContext } from "@/types/organization";

export type AppScreen =
  | "landing"
  | "individualAuth"   // NEW — login/register for individual
  | "employeeAuth"     // NEW — login/register for employee
  | "userHistory"      // NEW — returning user dashboard
  | "orgAdmin"
  | "orgAdminDash"
  | "orgEmployee"
  | "userDetails"
  | "welcome"
  | "test"
  | "analyzing"
  | "results";

export function useAssessment() {
  const [screen,    setScreen]    = useState<AppScreen>("landing");
  const [qi,        setQi]        = useState(0);
  const [showIntro, setShowIntro] = useState(false);
  const [answers,   setAnswersState] = useState<Answers>({});
  const [results,   setResults]   = useState<AssessmentResults | null>(null);
  const [aiData,    setAiData]    = useState<AIData | null>(null);
  const [userInfo,  setUserInfo]  = useState<UserInfo | null>(null);
  const [userId,    setUserId]    = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [orgContext, setOrgContext] = useState<OrgContext | null>(null);
  const [createdOrg, setCreatedOrg] = useState<unknown>(null);
  const [adminOrg,   setAdminOrg]  = useState<unknown>(null);

  // NEW — auth state for individual/employee
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [authEmail,  setAuthEmail]  = useState<string | null>(null);

  const userIdRef    = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const answersRef   = useRef<Answers>({});

  const q   = Qs[qi];
  const sec = q ? SECS.find(s => s.id === q.s) : null;

  const canGo = useMemo(() => {
    if (!q) return false;
    const a = answers[q.id];
    if (q.type === "open") return typeof a === "string" && (a as string).trim().length > 3;
    return a !== undefined && a !== null && a !== "";
  }, [q, answers]);

  const setAnswer = useCallback((v: string | number) => {
    setAnswersState(prev => {
      const next = { ...prev, [q.id]: v };
      answersRef.current = next;
      return next;
    });
  }, [q]);

  // NEW — called when new user signs up (individual or employee)
  const handleAuthNewUser = useCallback((authId: string, email: string) => {
    setAuthUserId(authId);
    setAuthEmail(email);
    // Pre-fill email in userDetails
    setScreen("userDetails");
  }, []);

  // NEW — called when returning user signs in
  const handleAuthReturning = useCallback((authId: string, email: string) => {
    setAuthUserId(authId);
    setAuthEmail(email);
    setScreen("userHistory");
  }, []);

  const handleOrgJoined = useCallback((org: unknown, dept: string) => {
    setOrgContext({ org: org as OrgContext["org"], department: dept, isAdmin: false });
    setScreen("userDetails");
  }, []);

  const handleUserDetailsSubmit = useCallback(async (info: UserInfo) => {
    // Merge auth email if available
    const mergedInfo = authEmail ? { ...info, email: authEmail } : info;
    setUserInfo(mergedInfo);

    let uId = genId();
    try {
      const userRow = await dbUpsertUser(mergedInfo, authUserId) as { id?: string };
      if (userRow?.id) uId = userRow.id;
    } catch (e) { console.warn("[useAssessment] dbUpsertUser failed:", e); }
    setUserId(uId);
    userIdRef.current = uId;

    let sId = genId();
    try {
      const sess = await dbCreateSession(uId, orgContext?.org?.id ?? null) as { id?: string };
      if (sess?.id) sId = sess.id;
    } catch (e) { console.warn("[useAssessment] dbCreateSession failed:", e); }
    setSessionId(sId);
    sessionIdRef.current = sId;
    setScreen("test");
    setShowIntro(true);
  }, [orgContext, authEmail]);

  const next = useCallback(async () => {
    if (qi < Qs.length - 1) {
      const nextSec = SECS.find(s => s.id === Qs[qi + 1].s);
      const curSec  = SECS.find(s => s.id === q.s);
      if (nextSec?.id !== curSec?.id) setShowIntro(true);
      setQi(i => i + 1);
    } else {
      setScreen("analyzing");
      const currentAnswers = answersRef.current;
      const sId = sessionIdRef.current;
      const uId = userIdRef.current;
      const openAns = Qs.filter(x => x.type === "open").map(x => (currentAnswers[x.id] as string) || "");
      const prelim  = computeScore(currentAnswers, null);
      let finalAi: AIData | null = null;
      let finalRes: AssessmentResults;
      try {
        const ai = await scoreWithAI(openAns, prelim.dims, currentAnswers as Record<string, unknown>);
        finalAi  = ai;
        finalRes = computeScore(currentAnswers, ai._divScores ?? null);
      } catch {
        finalRes = computeScore(currentAnswers, null);
      }
      if (sId && uId) {
        try { await dbSaveAnswers(sId, currentAnswers as Record<string, unknown>); } catch (e) { console.error(e); }
        try {
          await dbSaveResults(
            sId, uId, finalRes, finalAi,
            orgContext?.org?.id, orgContext?.department,
            userInfo?.name, userInfo?.designation
          );
        } catch (e) { console.error(e); }
      }
      setResults(finalRes);
      setAiData(finalAi);
      setScreen("results");
    }
  }, [qi, q, orgContext, userInfo]);

  const back = useCallback(() => { if (qi > 0) setQi(i => i - 1); }, [qi]);

  const retake = useCallback(() => {
    userIdRef.current    = null;
    sessionIdRef.current = null;
    answersRef.current   = {};
    setScreen("landing");
    setQi(0); setAnswersState({}); setResults(null);
    setAiData(null); setUserInfo(null); setUserId(null); setSessionId(null);
    setShowIntro(false); setOrgContext(null); setCreatedOrg(null); setAdminOrg(null);
    setAuthUserId(null); setAuthEmail(null);
  }, []);

  // Retake from history — go to userDetails keeping auth
  const retakeFromHistory = useCallback(() => {
    userIdRef.current    = null;
    sessionIdRef.current = null;
    answersRef.current   = {};
    setQi(0); setAnswersState({}); setResults(null);
    setAiData(null); setUserInfo(null); setUserId(null); setSessionId(null);
    setShowIntro(false); setOrgContext(null);
    setScreen("userDetails");
  }, []);

  return {
    screen, setScreen,
    qi, q, sec, showIntro, setShowIntro,
    answers, setAnswer, canGo,
    results, aiData, setResults, setAiData,
    userInfo, userId, sessionId,
    orgContext, setOrgContext,
    createdOrg, setCreatedOrg,
    adminOrg, setAdminOrg,
    authUserId, authEmail,
    handleAuthNewUser, handleAuthReturning,
    handleOrgJoined, handleUserDetailsSubmit,
    next, back, retake, retakeFromHistory,
  };
}