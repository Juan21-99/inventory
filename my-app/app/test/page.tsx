"use client";

import { useState, useCallback } from "react";
import { AcademicYearActionsDropdown } from "./AcademicYearActionsDropdown";
import { CurriculumDropdown } from "./CurriculumDropdown";
import { CategoryDropdown } from "../admin/products/CategoryDropdown";
import { toast } from "sonner";

type Status = "draft" | "active" | "completed" | "archived";

export default function TestPage() {
  const [status, setStatus] = useState<Status>("draft");
  const [logs, setLogs] = useState<string[]>([]);

  // State untuk dropdowns
  const [curriculum, setCurriculum] = useState("");
  const [category, setCategory] = useState("coffee");

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
    toast.success(message);
  };

  // Memoized callbacks
  const handleCurriculumChange = useCallback((val: string) => {
    setCurriculum(val);
  }, []);

  const handleCategoryChange = useCallback((val: string) => {
    setCategory(val);
  }, []);

  return (
    <div className="min-h-screen bg-stone-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-stone-900">Test Dropdown Comparison</h1>

        {/* Curriculum Dropdown (dengan FloatingPortal) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            1. CurriculumDropdown (FloatingPortal)
          </h2>
          <p className="text-sm text-stone-500 mb-4">
            Menggunakan FloatingPortal - render di luar DOM tree
          </p>
          <div className="max-w-xs">
            <CurriculumDropdown
              value={curriculum}
              onChange={handleCurriculumChange}
              showLabel={false}
            />
          </div>
          <p className="mt-3 text-sm text-stone-600">
            Selected: <span className="font-bold">{curriculum || "None"}</span>
          </p>
        </div>

        {/* Category Dropdown (dari Products) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            2. CategoryDropdown (dari Products)
          </h2>
          <p className="text-sm text-stone-500 mb-4">
            Menggunakan absolute positioning - render di dalam parent
          </p>
          <div className="max-w-xs">
            <CategoryDropdown
              value={category}
              onChange={handleCategoryChange}
            />
          </div>
          <p className="mt-3 text-sm text-stone-600">
            Selected: <span className="font-bold">{category}</span>
          </p>
        </div>

        {/* Status Selector */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            3. AcademicYearActionsDropdown
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {(["draft", "active", "completed", "archived"] as Status[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-4 py-2 rounded-lg font-medium capitalize ${
                  status === s
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div
            id="academic-year-table-container"
            className="flex items-center gap-4"
          >
            <span className="text-stone-600">Actions:</span>
            <AcademicYearActionsDropdown
              status={status}
              onView={() => addLog("View clicked")}
              onEdit={() => addLog("Edit clicked")}
              onDelete={() => addLog("Delete clicked")}
              onActivate={() => {
                addLog("Activate clicked");
                setStatus("active");
              }}
              onDeactivate={() => {
                addLog("Deactivate clicked");
                setStatus("completed");
              }}
              onArchive={() => {
                addLog("Archive clicked");
                setStatus("archived");
              }}
            />
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-800">Log Aksi</h2>
            <button
              onClick={() => setLogs([])}
              className="text-sm text-stone-500 hover:text-stone-700"
            >
              Clear
            </button>
          </div>

          {logs.length === 0 ? (
            <p className="text-stone-400 text-sm">Belum ada aksi...</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {logs.map((log, i) => (
                <p key={i} className="text-sm text-stone-600 font-mono">
                  {log}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
