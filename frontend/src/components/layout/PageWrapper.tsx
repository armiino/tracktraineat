import React from "react";

export default function PageWrapper({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 px-4 py-12 flex justify-center items-start">
      {children}
    </div>
  );
}
