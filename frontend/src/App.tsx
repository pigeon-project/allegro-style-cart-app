import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { useMutation, useQuery } from "@tanstack/react-query";
import wretch from "wretch";
import type { IssueCreationRequest, IssueResponse } from "./api-types.ts";
import { useTheme } from "./theme";

export default function App() {
  const [count, setCount] = useState(0);
  const { mode, toggleMode } = useTheme();

  const issuesQuery = useQuery({
    queryKey: ["issues"],
    queryFn: () => wretch().get("/api/issues").json<IssueResponse[]>(),
  });

  const issuesMutation = useMutation({
    mutationFn: (request: IssueCreationRequest) =>
      wretch().post(request, "/api/issues").json(),
    onMutate: async (issueCreationRequest, context) => {
      await context.client.cancelQueries({ queryKey: ["issues"] });
      const previousIssues = context.client.getQueryData(["issues"]);
      context.client.setQueryData(["issues"], (old: IssueResponse[]) => [
        ...old,
        { title: issueCreationRequest.title },
      ]);
      return { previousIssues: previousIssues };
    },
    onError: (_, _2, onMutateResult, context) => {
      if (onMutateResult)
        context.client.setQueryData(["issues"], onMutateResult.previousIssues);
    },
    onSettled: (_, _2, _3, _4, context) =>
      context.client.invalidateQueries({ queryKey: ["issues"] }),
  });

  return (
    <div
      className="min-h-screen p-6 flex items-center justify-center"
      style={{
        backgroundColor: "var(--m-color-desk)",
        color: "var(--m-color-text)",
      }}
    >
      <div className="w-full max-w-xl">
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-6 mb-4">
            <a
              href="https://vite.dev"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl p-3 border shadow-inner"
              style={{
                backgroundColor: "var(--m-color-card)",
                borderColor: "var(--m-color-border)",
              }}
            >
              <img src={viteLogo} alt="Vite logo" className="h-12 w-12" />
            </a>
            <a
              href="https://react.dev"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl p-3 border shadow-inner"
              style={{
                backgroundColor: "var(--m-color-card)",
                borderColor: "var(--m-color-border)",
              }}
            >
              <img src={reactLogo} alt="React logo" className="h-12 w-12" />
            </a>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
            Allegro Design System Demo
          </h1>
          <p style={{ color: "var(--m-color-text-secondary)" }}>
            Theme: {mode} mode
          </p>
          <button
            onClick={toggleMode}
            className="mt-3 px-4 py-2 rounded font-medium"
            style={{
              backgroundColor: "var(--m-color-primary)",
              color: "var(--m-color-accent-on-primary)",
            }}
          >
            Toggle Theme
          </button>
        </header>
        <main>
          <div
            className="border rounded-2xl shadow-xl backdrop-blur p-6 sm:p-8"
            style={{
              backgroundColor: "var(--m-color-card)",
              borderColor: "var(--m-color-border)",
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p style={{ color: "var(--m-color-text-secondary)" }}>
                  You clicked the button:
                </p>
                <p
                  className="text-4xl font-bold"
                  style={{ color: "var(--m-color-primary)" }}
                >
                  {count} times
                </p>
              </div>
              <button
                onClick={() => setCount((c) => c + 1)}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: "var(--m-color-primary)",
                  color: "var(--m-color-accent-on-primary)",
                }}
              >
                Increment
              </button>
            </div>
          </div>

          <div
            className="border rounded-2xl shadow-xl backdrop-blur p-6 sm:p-8 mt-8"
            style={{
              backgroundColor: "var(--m-color-card)",
              borderColor: "var(--m-color-border)",
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p style={{ color: "var(--m-color-text-secondary)" }}>
                  Created issues
                </p>
                <p
                  className="text-4xl font-bold"
                  style={{ color: "var(--m-color-primary)" }}
                >
                  {count}
                </p>
              </div>
              <button
                onClick={() => issuesMutation.mutate({ title: "random title" })}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: "var(--m-color-primary)",
                  color: "var(--m-color-accent-on-primary)",
                }}
              >
                Add issue
              </button>
            </div>
            <IssuesList data={issuesQuery.data} />
          </div>
        </main>
      </div>
    </div>
  );
}

function IssuesList({ data }: { data: IssueResponse[] | undefined }) {
  if (!data) return null;
  return (
    <ul className="mt-4">
      {data.map((issue) => (
        <li
          key={issue.id}
          className="text-sm list-disc"
          style={{ color: "var(--m-color-text-secondary)" }}
        >
          ({`${issue.id?.substring(0, 6)}...`}) &gt; {issue.title}
        </li>
      ))}
    </ul>
  );
}
