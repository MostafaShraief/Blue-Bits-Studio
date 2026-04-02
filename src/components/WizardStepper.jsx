import { Check } from 'lucide-react';

/**
 * Horizontal step indicator for wizards.
 *
 * @param {{ steps: string[], current: number }} props
 *   steps  — array of Arabic step labels
 *   current — 0-indexed current step
 */
export default function WizardStepper({ steps, current }) {
    return (
        <div className="flex items-center justify-center gap-2 mb-8 select-none">
            {steps.map((label, i) => {
                const isDone = i < current;
                const isActive = i === current;

                return (
                    <div key={i} className="flex items-center gap-2">
                        {/* Circle */}
                        <div
                            className={`
                flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold
                transition-default
                ${isDone
                                    ? 'bg-success text-white'
                                    : isActive
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'bg-border text-text-secondary'
                                }
              `}
                        >
                            {isDone ? <Check size={18} strokeWidth={3} /> : i + 1}
                        </div>

                        {/* Label */}
                        <span
                            className={`text-sm font-medium hidden sm:inline ${isActive ? 'text-primary' : isDone ? 'text-success' : 'text-text-muted'
                                }`}
                        >
                            {label}
                        </span>

                        {/* Connector line */}
                        {i < steps.length - 1 && (
                            <div
                                className={`w-10 h-0.5 mx-1 rounded-full ${isDone ? 'bg-success' : 'bg-border'
                                    }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
