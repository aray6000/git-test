"use client";

import React, { use } from "react";
import { ViewPaste } from "@/components/view-paste";

export default function PasteViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="max-w-4xl mx-auto">
      <ViewPaste pasteId={id} />
    </div>
  );
}
