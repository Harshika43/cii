import { Qs } from "@/constants/questions";
import { DIM } from "@/constants/dimensions";
import type { Answers, AssessmentResults } from "@/types/assessment";

export function computeScore(answers: Answers, aiScores?: number[] | null): AssessmentResults {
  const openQs = Qs.filter(q => q.type === "open");

  const div = aiScores
    ? aiScores.slice(0, 2).reduce((s, v) => s + v, 0) / 2
    : openQs.reduce((s, q) => {
        const n = ((answers[q.id] as string) || "")
          .split("\n")
          .filter(l => l.trim().length > 2).length;
        return s + Math.min((n / 7) * 100, 100);
      }, 0) / openQs.length;

  const ratQs = Qs.filter(q => q.type === "rat");
  const assoc = (ratQs.filter(q => answers[q.id] === (q as any).answer).length / ratQs.length) * 100;

  const s2Qs = Qs.filter(q => q.s === 2);
  const s2Sum = s2Qs.reduce((s, q) => {
    const v = (answers[q.id] as number) ?? 3;
    return s + ((q as any).reversed ? (6 - v) : v);
  }, 0);
  const pers1 = ((s2Sum - s2Qs.length) / (s2Qs.length * 4)) * 100;

  const s3Qs = Qs.filter(q => q.s === 3);
  const s3Sum = s3Qs.reduce((s, q) => {
    const v = (answers[q.id] as number) ?? 3;
    return s + ((q as any).reversed ? (6 - v) : v);
  }, 0);
  const pers2 = ((s3Sum - s3Qs.length) / (s3Qs.length * 4)) * 100;

  const beh = Qs.filter(q => q.s === 4).reduce((s, q) => {
    const i = answers[q.id] as number;
    return s + (i != null ? (q as any).scores[i] : 1);
  }, 0);
  const behS = ((beh - 5) / 15) * 100;

  const inn = Qs.filter(q => q.s === 5).reduce((s, q) => {
    const i = answers[q.id] as number;
    return s + (i != null ? (q as any).scores[i] : 1);
  }, 0);
  const innS = ((inn - 5) / 15) * 100;

  const dims = [div, assoc, pers1, pers2, behS, innS].map(d =>
    Math.round(Math.max(0, Math.min(100, d)))
  );
  const cii = Math.round(dims.reduce((s, d, i) => s + d * DIM.weights[i], 0));

  return { dims, cii };
}
