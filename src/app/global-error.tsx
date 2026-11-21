"use client";

import * as React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[matrimap:ui] Unhandled root error", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background: "#fbf8f3",
          color: "#302827",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <main style={{ maxWidth: "440px", textAlign: "center" }}>
          <h1>MatriMap is temporarily unavailable</h1>
          <p>We couldn’t load the application. Please try again.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "12px",
              border: 0,
              borderRadius: "8px",
              padding: "10px 18px",
              background: "#863649",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
