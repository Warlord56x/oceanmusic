"use client";

import { ReactNode, useRef } from "react";
import dynamic from "next/dynamic";
const Scene = dynamic(() => import("@/components/canvas/Scene"), {
  ssr: false,
});

type Props = { children: ReactNode };

const Layout = ({ children }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={"canvasControls"}
      style={{
        position: "relative",
        width: " 100%",
        height: "100%",
        overflow: "auto",
      }}
    >
      {children}
      <Scene
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: -1,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
        }}
        eventSource={ref}
        eventPrefix="client"
      />
    </div>
  );
};

export { Layout };
