"use client";

import { useEffect, useState } from "react";
import { site } from "@/data/site";

export default function LocalTime({ className = "" }: { className?: string }) {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString("en-IN", { timeZone: site.timeZone, hour: "2-digit", minute: "2-digit" });
    const update = () => setTime(fmt());
    const first = setTimeout(update, 0);
    const id = setInterval(update, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  return <span className={className}>Local time {time}</span>;
}
