"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";

interface WorkflowStep {
  id: string;
  label: string;
  description?: string;
}

interface AppContextType {
  workflowSteps: WorkflowStep[] | undefined;
  currentStep: string | undefined;
  setWorkflowState: (
    steps: WorkflowStep[] | undefined,
    currentStep: string | undefined
  ) => void;
  quota: number;
  setQuota: (quota: number) => void;
  plan: "FREE" | "STANDARD" | "PRO";
  setPlan: (plan: "FREE" | "STANDARD" | "PRO") => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [workflowSteps, setWorkflowSteps] = useState<
    WorkflowStep[] | undefined
  >();
  const [currentStep, setCurrentStep] = useState<string | undefined>();
  const [quota, setQuota] = useState(2);
  const [plan, setPlan] = useState<"FREE" | "STANDARD" | "PRO">("FREE");

  const setWorkflowState = useCallback(
    (steps: WorkflowStep[] | undefined, current: string | undefined) => {
      setWorkflowSteps(steps);
      setCurrentStep(current);
    },
    []
  );

  const value = useMemo(
    () => ({
      workflowSteps,
      currentStep,
      setWorkflowState,
      quota,
      setQuota,
      plan,
      setPlan,
    }),
    [workflowSteps, currentStep, setWorkflowState, quota, plan]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
