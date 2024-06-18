"use client";

import { r3f } from "@/helpers/global";
import React, { ReactNode } from "react";

type Props = { children: ReactNode };

export const Three = ({ children }: Props) => {
  return <r3f.In>{children}</r3f.In>;
};
