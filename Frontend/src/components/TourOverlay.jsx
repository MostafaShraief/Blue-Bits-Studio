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
    const [cardWidth, setCardWidth] = useState(0);
    const cardRef = useRef(null);
    const dir = isRTL() ? 'rtl' : 'ltr';

    useEffect(() => {
        if (!isActive || !currentStep) return;

        const currentSelector = currentStep.selector;
        let retryCount = 0;
        const maxRetries = 5;

        const updatePosition = () => {
            const el = document.querySelector(currentSelector);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('ring-4', 'ring-primary', 'ring-offset-2', 'ring-offset-surface', 'transition-shadow');

                setTimeout(() => {
                    setTargetRect(el.getBoundingClientRect());
                }, 400);
            } else if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(updatePosition, 500);
            } else {
                setTargetRect(null);
            }
        };

        const timer = setTimeout(updatePosition, 200);
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
        const cardW = cardRef.current.offsetWidth;
        setCardWidth(cardW);
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

    const gap = 14;
    const rtl = dir === 'rtl';

    let overlayStyle;
    let arrowOffset = 24;

    if (targetRect) {
        const targetCenter = targetRect.left + targetRect.width / 2;
        const vpWidth = window.innerWidth;
        const cardMaxW = Math.min(420, vpWidth - gap * 2);
        const halfCard = cardWidth > 0 ? cardWidth / 2 : cardMaxW / 2;

        let cardLeft = targetCenter - halfCard;
        cardLeft = Math.max(gap, Math.min(cardLeft, vpWidth - cardMaxW - gap));

        const topPos = isAbove
            ? Math.max(gap, targetRect.top - (cardRef.current?.offsetHeight || 200) - gap)
            : targetRect.bottom + gap;

        overlayStyle = {
            position: 'fixed',
            top: topPos,
            left: cardLeft,
            zIndex: 9999,
            maxWidth: `${cardMaxW}px`,
            width: '100%',
        };

        const cardLeftEdge = cardLeft;
        arrowOffset = targetCenter - cardLeftEdge;
        arrowOffset = Math.max(20, Math.min(arrowOffset, cardMaxW - 20));
    } else {
        overlayStyle = {
            position: 'fixed',
            bottom: '2rem',
            insetInlineStart: '2rem',
            zIndex: 9999,
            maxWidth: '420px',
            width: 'calc(100% - 2rem)',
        };
    }

    const arrowStyle = targetRect ? {
        position: 'absolute',
        width: '14px',
        height: '14px',
        backgroundColor: 'var(--color-surface-card)',
        transform: 'rotate(45deg)',
        transformOrigin: 'center',
        insetInlineStart: `${arrowOffset - 7}px`,
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
            key={currentStepIndex}
            ref={cardRef}
            style={overlayStyle}
            className="bg-surface-card border-2 border-primary/40 shadow-2xl shadow-primary/20 rounded-2xl p-5 w-full animate-fade-slide-in"
            dir="rtl"
        >
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0">
                        {currentStepIndex + 1}
                    </span>
                    <span className="leading-tight">{currentStep.title}</span>
                </h3>
                <button
                    onClick={stopTour}
                    className="p-1 rounded-lg hover:bg-surface-hover text-text-muted transition-colors shrink-0"
                >
                    <X size={18} />
                </button>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed mb-5 whitespace-pre-line">
                {currentStep.content}
            </p>

            <div className="flex items-center justify-between mt-auto gap-2">
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
                <span className="text-xs font-bold text-text-muted bg-surface-hover px-2 py-1 rounded-md shrink-0">
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
