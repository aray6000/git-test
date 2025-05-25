"use client";

import React from "react";
import { ViewPaste } from "@/components/view-paste";

export default function PasteViewPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-4xl mx-auto">
      <ViewPaste pasteId={params.id} />
    </div>
  );
}
