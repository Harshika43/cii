export const PROFILES = [
  { min:85, name:"Visionary Innovator",   tag:"Top 5%",       color:"#1A6FC4", range:"85–100", desc:"Exceptional ideational fluency, rare associative depth, and the drive to act on bold visions." },
  { min:70, name:"Creative Catalyst",     tag:"Top 20%",      color:"#0D9E6E", range:"70–84",  desc:"Strong divergent thinking with real motivation to act on unconventional ideas." },
  { min:55, name:"Adaptive Innovator",    tag:"Above Average", color:"#6B3FA0", range:"55–69",  desc:"Meaningful creative capacity with clear room to grow through deliberate practice." },
  { min:40, name:"Structured Thinker",    tag:"Average",      color:"#F07C1A", range:"40–54",  desc:"Strong analytical skills within frameworks — creative potential underutilised." },
  { min:0,  name:"Conventional Executor", tag:"Developing",   color:"#6b8aaa", range:"0–39",   desc:"Excels at reliable implementation — creative capacity grows with targeted exercises." },
] as const;

export type Profile = typeof PROFILES[number];

export function getProfile(cii: number) {
  return PROFILES.find(p => cii >= p.min) ?? PROFILES[PROFILES.length - 1];
}
