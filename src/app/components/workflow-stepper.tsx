import { cn } from "../lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface WorkflowStepperProps {
  steps: Step[];
  currentStep: string;
}

export function WorkflowStepper({ steps, currentStep }: WorkflowStepperProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="flex items-center">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step Circle and Label */}
            <div className="flex items-center gap-2">
              {/* Circle */}
              <div
                className={cn(
                  "flex items-center justify-center size-6 rounded-full text-xs font-medium transition-all",
                  isCompleted &&
                    "bg-primary text-primary-foreground",
                  isCurrent &&
                    "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  isUpcoming &&
                    "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="size-3.5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-xs font-medium whitespace-nowrap transition-colors",
                  isCompleted && "text-foreground",
                  isCurrent && "text-foreground",
                  isUpcoming && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="w-8 h-px mx-2 bg-border relative overflow-hidden">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 bg-primary transition-all duration-500",
                    isCompleted && "w-full",
                    (isCurrent || isUpcoming) && "w-0"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
