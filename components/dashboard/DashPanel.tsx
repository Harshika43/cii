"use client";
import type { ReactNode } from "react";

interface Props {
  title:    string;
  children: ReactNode;
  style?:   React.CSSProperties;
}

export function DashPanel({ title, children, style = {} }: Props) {
  return (
    <div className="dash-panel" style={{
      background:"#ffffff",
      border:"1.5px solid #dbe8f5",
      borderRadius:8, overflow:"hidden",
      display:"flex", flexDirection:"column",
      boxShadow:"0 2px 16px rgba(13,43,82,0.08)",
      ...style,
    }}>
      <div style={{
        background:"linear-gradient(135deg,#0D2B52 0%,#1A6FC4 100%)",
        color:"#fff", fontSize:"0.58rem", fontWeight:700,
        letterSpacing:"0.16em", textAlign:"center",
        padding:"6px 10px", textTransform:"uppercase", flexShrink:0,
        borderBottom:"1px solid rgba(26,111,196,0.2)",
        display:"flex", alignItems:"center", justifyContent:"center", gap:6,
      }}>
        <div style={{ width:4, height:4, borderRadius:"50%", background:"rgba(74,159,224,0.8)" }}/>
        {title}
        <div style={{ width:4, height:4, borderRadius:"50%", background:"rgba(74,159,224,0.8)" }}/>
      </div>
      <div style={{ flex:1, minHeight:0, overflow:"hidden" }}>{children}</div>
    </div>
  );
}
