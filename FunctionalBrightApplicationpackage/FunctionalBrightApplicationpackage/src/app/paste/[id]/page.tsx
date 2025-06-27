"use client";

import React, { use, Suspense } from "react";
import { ViewPaste } from "@/components/view-paste";

function PasteContent({ id }: { id: string }) {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Invalid Paste ID</h1>
        <p className="text-muted-foreground">The paste ID provided is not valid.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ViewPaste pasteId={id} />
    </div>
  );
}

export default function PasteViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="relative">
          <div className="h-10 w-10 border-2 border-secondary rounded-full animate-spin border-t-transparent" />
          <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-pulse" />
        </div>
      </div>
    }>
      <PasteContent id={id} />
    </Suspense>
  );
}
