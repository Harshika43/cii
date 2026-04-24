"use client";

export function TopBrandBar() {
  return (
    <div style={{
      position:"fixed", top:0, left:0, right:0, zIndex:50,
      background:"rgba(13,43,82,0.92)",
      backdropFilter:"blur(12px)",
      borderBottom:"1px solid rgba(26,111,196,0.25)",
      padding:"10px 24px",
      display:"flex", alignItems:"center", justifyContent:"space-between",
    }}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{
          width:32, height:32, borderRadius:8,
          background:"linear-gradient(135deg,#1A6FC4,#4A9FE0)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"1rem", fontWeight:900, color:"#fff",
          boxShadow:"0 2px 8px rgba(26,111,196,0.4)",
        }}>i</div>
        <div>
          <div style={{fontSize:"0.68rem",fontWeight:800,color:"#fff",letterSpacing:"0.05em",lineHeight:1}}>infopace</div>
          <div style={{fontSize:"0.48rem",color:"rgba(74,159,224,0.8)",letterSpacing:"0.2em",fontWeight:600}}>"commitment to excellence"</div>
        </div>
      </div>
      <div style={{
        fontSize:"0.52rem", letterSpacing:"0.3em", color:"rgba(194,212,232,0.7)",
        fontWeight:700, display:"flex", alignItems:"center", gap:6,
      }}>
        <div style={{width:6,height:6,borderRadius:"50%",background:"#4A9FE0",animation:"pulse 2s infinite"}}/>
        AI-POWERED ASSESSMENT
      </div>
    </div>
  );
}
