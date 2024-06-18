"use client";

import {
  CSSProperties,
  forwardRef,
  ReactNode,
  useImperativeHandle,
  useRef,
} from "react";
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
  fixed?: boolean;
};

const View = forwardRef(({ children, orbit, fixed, ...props }: Props, ref) => {
  const localRef = useRef<HTMLDivElement>(null!);
  useImperativeHandle(ref, () => localRef.current);

  return (
    <>
      <div ref={localRef} {...props} />
      <Three>
        {fixed && <PerspectiveCamera makeDefault position={[0, 0, 600]} />}
        {orbit && <OrbitControls enablePan={false} />}
        <ViewImpl track={localRef}>{children}</ViewImpl>
      </Three>
    </>
  );
});
View.displayName = "View";

export { View };
