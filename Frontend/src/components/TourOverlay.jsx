import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTour } from '../contexts/TourContext';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { createPortal } from 'react-dom';

function isRTL() {
    return document.documentElement.dir === 'rtl';
}

export default function TourOverlay() {
    const { isActive, currentStep, stopTour, nextStep, prevStep, currentStepIndex, totalSteps } = useTour();
    const [targetRect, setTargetRect] = useState(null);
    const [isAbove, setIsAbove] = useState(false);
    const cardRef = useRef(null);
    const dir = isRTL() ? 'rtl' : 'ltr';

    useEffect(() => {
        if (!isActive || !currentStep) return;

        const currentSelector = currentStep.selector;

        const updatePosition = () => {
            const el = document.querySelector(currentSelector);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('ring-4', 'ring-primary', 'ring-offset-2', 'ring-offset-surface', 'transition-shadow');

                setTimeout(() => {
                    setTargetRect(el.getBoundingClientRect());
                }, 400);
            } else {
                setTargetRect(null);
            }
        };

        const timer = setTimeout(updatePosition, 100);
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, { passive: true });

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
            const el = document.querySelector(currentSelector);
            if (el) {
                el.classList.remove('ring-4', 'ring-primary', 'ring-offset-2', 'ring-offset-surface', 'transition-shadow');
            }
        };
    }, [isActive, currentStep]);

    const measureCard = useCallback(() => {
        if (!cardRef.current || !targetRect) return;
        const cardHeight = cardRef.current.offsetHeight;
        const margin = 20;
        const spaceBelow = window.innerHeight - targetRect.bottom;
        const spaceAbove = targetRect.top;
        setIsAbove(cardHeight + margin > spaceBelow && spaceAbove > spaceBelow);
    }, [targetRect]);

    useEffect(() => {
        if (!isActive || !currentStep || !targetRect) return;
        const raf = requestAnimationFrame(() => {
            measureCard();
        });
        return () => cancelAnimationFrame(raf);
    }, [isActive, currentStep, targetRect, measureCard]);

    if (!isActive || !currentStep) return null;

    const gap = 12;
    const rtl = dir === 'rtl';

    const overlayStyle = targetRect ? {
        position: 'fixed',
        top: isAbove
            ? Math.max(gap, targetRect.top - (cardRef.current?.offsetHeight || 200) - gap)
            : targetRect.bottom + gap,
        ...(rtl
            ? { right: Math.max(gap, window.innerWidth - targetRect.right) }
            : { left: Math.max(gap, targetRect.left) }
        ),
        zIndex: 9999,
        maxWidth: '350px'
    } : {
        position: 'fixed',
        bottom: '2rem',
        ...(rtl ? { right: '2rem' } : { left: '2rem' }),
        zIndex: 9999,
        maxWidth: '350px'
    };

    const arrowStyle = targetRect ? {
        position: 'absolute',
        width: '14px',
        height: '14px',
        backgroundColor: 'var(--color-surface-card)',
        transform: 'rotate(45deg)',
        transformOrigin: 'center',
        ...(rtl ? { right: '24px' } : { left: '24px' }),
        top: isAbove ? 'auto' : '-7px',
        bottom: isAbove ? '-7px' : 'auto',
        borderTopWidth: isAbove ? '0' : '2px',
        borderInlineStartWidth: isAbove ? '0' : '2px',
        borderBottomWidth: isAbove ? '2px' : '0',
        borderInlineEndWidth: isAbove ? '2px' : '0',
        borderColor: 'var(--color-primary / 0.4)',
    } : null;

    const card = (
        <div
            ref={cardRef}
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

            {arrowStyle && (
                <div style={arrowStyle} />
            )}
        </div>
    );

    return createPortal(card, document.body);
}
