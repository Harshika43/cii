import { C } from "./theme";

export const SECS = [
  { id:1, title:"COGNITIVE CREATIVITY",  sub:"Divergent Thinking & Remote Association",  color:C.s1, short:"Cognitive"  },
  { id:2, title:"INNER LANDSCAPE",       sub:"Risk Tolerance & Openness to Experience",  color:C.s2, short:"Mindset"    },
  { id:3, title:"VISION & DRIVE",        sub:"Creative Motivation & Metacognition",       color:C.s3, short:"Vision"    },
  { id:4, title:"CREATIVE BEHAVIOR",     sub:"Real-World Actions & Creative Habits",      color:C.s4, short:"Behavior"  },
  { id:5, title:"INNOVATION THINKING",   sub:"Scenario & Consequence Reasoning",          color:C.s5, short:"Innovation"},
] as const;

export type Section = typeof SECS[number];
