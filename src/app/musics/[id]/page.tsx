"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Music } from "@/lib/data/music";
import { getMusic } from "@/lib/firebase/firestore";

export default function Page({ params }: { params: { id: string } }) {
  const [music, setMusic] = useState<Music>(null!);

  useEffect(() => {
    getMusic(params.id).then((m) => setMusic(m));
  }, [params.id]);

  return (
    <div>
      <Image
        loading="eager"
        alt={music?.name}
        src={music?.cover || "/next.svg"}
        width={500}
        height={500}
      />
      Music: {music?.name} || Upload Date:{" "}
      {music?.uploadDate.toLocaleDateString()}
    </div>
  );
}
