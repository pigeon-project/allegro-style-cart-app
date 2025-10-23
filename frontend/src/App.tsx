import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { useMutation, useQuery } from "@tanstack/react-query";
import wretch from "wretch";
import type { IssueCreationRequest, IssueResponse } from "./api-types.ts";

export default function App() {
  const [count, setCount] = useState(0);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-6 mb-4">
            <a
              href="https://vite.dev"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl p-3 bg-white/5 border border-white/10 shadow-inner hover:bg-white/10"
            >
              <img src={viteLogo} alt="Vite logo" className="h-12 w-12" />
            </a>
            <a
              href="https://react.dev"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl p-3 bg-white/5 border border-white/10 shadow-inner hover:bg-white/10"
            >
              <img src={reactLogo} alt="React logo" className="h-12 w-12" />
            </a>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Vite + React + Tailwind
          </h1>
          <p className="mt-2 text-slate-300">
            A tiny demo styled with Tailwind CSS
          </p>
        </header>
        <main>
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl shadow-xl backdrop-blur p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-slate-300">You clicked the button:</p>
                <p className="text-4xl font-bold text-indigo-400">
                  {count} times
                </p>
              </div>
              <button
                onClick={() => setCount((c) => c + 1)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-white font-medium shadow-lg shadow-indigo-500/25 hover:bg-indigo-400 active:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Increment
              </button>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl shadow-xl backdrop-blur p-6 sm:p-8 mt-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-slate-300">Created issues</p>
                <p className="text-4xl font-bold text-indigo-400">{count}</p>
              </div>
              <button
                onClick={() => issuesMutation.mutate({ title: "random title" })}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-white font-medium shadow-lg shadow-indigo-500/25 hover:bg-indigo-400 active:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 focus:ring-offset-slate-900"
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
        <li key={issue.id} className="text-sm text-slate-300 list-disc">
          ({`${issue.id?.substring(0, 6)}...`}) &gt; {issue.title}
        </li>
      ))}
    </ul>
  );
}
