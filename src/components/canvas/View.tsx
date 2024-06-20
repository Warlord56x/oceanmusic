"use client";

import {
  CSSProperties,
  forwardRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import * as THREE from "three";
import {
  OrbitControls,
  PerspectiveCamera,
  View as ViewImpl,
} from "@react-three/drei";
import { Three } from "@/helpers/Three";

type Props = {
  children: ReactNode;
  style?: CSSProperties;
  orbit?: boolean;
  far?: boolean;
};

const View = forwardRef(({ children, orbit, far, ...props }: Props, ref) => {
  const localRef = useRef<HTMLDivElement>(null!);
  useImperativeHandle(ref, () => localRef.current);

  return (
    <>
      <div ref={localRef} {...props} />
      <Three>
        <PerspectiveCamera makeDefault position={[0, 0, far ? 600 : 10]} />
        {orbit && <OrbitControls enablePan={false} />}
        <ViewImpl track={localRef}>{children}</ViewImpl>
      </Three>
    </>
  );
});
View.displayName = "View";

export { View };
