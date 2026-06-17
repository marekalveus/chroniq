"use client";

import dynamic from "next/dynamic";

const ObjectMapPicker = dynamic(
  () => import("@/components/ObjectMapPicker"),
  { ssr: false }
);

export default function ObjectMapPickerClient() {
  return <ObjectMapPicker />;
}
