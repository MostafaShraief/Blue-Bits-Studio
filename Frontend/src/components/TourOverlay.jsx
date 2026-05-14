import React, { useEffect, useState } from 'react';
import { useTour } from '../contexts/TourContext';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function TourOverlay() {
    const { isActive, currentStep, stopTour, nextStep, prevStep, currentStepIndex, totalSteps } = useTour();
    const [targetRect, setTargetRect] = useState(null);

    useEffect(() => {
        if (!isActive || !currentStep) return;

        const updatePosition = () => {
            const el = document.querySelector(currentStep.selector);
            if (el) {
                // Scroll into view
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Add highlight class
                el.classList.add('ring-4', 'ring-primary', 'ring-offset-2', 'ring-offset-surface', 'transition-shadow');
                
                setTimeout(() => {
                    const rect = el.getBoundingClientRect();
                    setTargetRect(rect);
                }, 400); // Wait for scroll
            } else {
                setTargetRect(null); // Fallback position
            }
        };

        // Small delay to allow react to render the page
        const timer = setTimeout(updatePosition, 100);
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, { passive: true });

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
            const el = document.querySelector(currentStep?.selector);
            if (el) {
                el.classList.remove('ring-4', 'ring-primary', 'ring-offset-2', 'ring-offset-surface', 'transition-shadow');
            }
        };
    }, [isActive, currentStep]);

    if (!isActive || !currentStep) return null;

    // Use absolute positioning relative to viewport, or default to bottom-left fallback
    const overlayStyle = targetRect ? {
        position: 'fixed',
        top: targetRect.bottom + 20 + 200 > window.innerHeight 
             ? Math.max(20, targetRect.top - 200) // Above if no space below
             : targetRect.bottom + 20, // Below default
        left: Math.max(20, targetRect.left), // Align left, bounded by screen
        zIndex: 9999,
        maxWidth: '350px'
    } : {
        position: 'fixed',
        bottom: '2rem',
        left: '2rem', // Equivalent to start-8 in LTR, down left fallback
        zIndex: 9999,
        maxWidth: '350px'
    };

    const card = (
        <div 
            style={overlayStyle}
            className="bg-surface-card border-2 border-primary/40 shadow-2xl shadow-primary/20 rounded-2xl p-5 w-full animate-fade-in"
            dir="rtl"
        >
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                        {currentStepIndex + 1}
                    </span>
                    {currentStep.title}
                </h3>
                <button 
                    onClick={stopTour}
                    className="p-1 rounded-lg hover:bg-surface-hover text-text-muted transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
            
            <p className="text-sm text-text-secondary leading-relaxed mb-5">
                {currentStep.content}
            </p>
            
            <div className="flex items-center justify-between mt-auto">
                <div className="flex gap-2">
                    <button
                        onClick={prevStep}
                        disabled={currentStepIndex === 0}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border hover:bg-surface-hover disabled:opacity-50 transition-colors"
                    >
                        السابق
                    </button>
                    <button
                        onClick={nextStep}
                        className="px-4 py-1.5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-colors"
                    >
                        {currentStepIndex === totalSteps - 1 ? 'إنهاء الجولة' : 'التالي'}
                    </button>
                </div>
                <span className="text-xs font-bold text-text-muted bg-surface-hover px-2 py-1 rounded-md">
                    {currentStepIndex + 1} / {totalSteps}
                </span>
            </div>
            
            {/* Spotlight Arrow Indicator if Target exists */}
            {targetRect && (
                <div 
                    className="absolute w-4 h-4 bg-surface-card border-t-2 border-l-2 border-primary/40 rotate-45 transform origin-center"
                    style={{
                        top: targetRect.bottom + 20 + 200 > window.innerHeight ? 'auto' : '-9px',
                        bottom: targetRect.bottom + 20 + 200 > window.innerHeight ? '-9px' : 'auto',
                        borderBottomWidth: targetRect.bottom + 20 + 200 > window.innerHeight ? '2px' : '0',
                        borderRightWidth: targetRect.bottom + 20 + 200 > window.innerHeight ? '2px' : '0',
                        borderTopWidth: targetRect.bottom + 20 + 200 > window.innerHeight ? '0' : '2px',
                        borderLeftWidth: targetRect.bottom + 20 + 200 > window.innerHeight ? '0' : '2px',
                        left: '20px'
                    }}
                />
            )}
        </div>
    );

    return createPortal(card, document.body);
}
