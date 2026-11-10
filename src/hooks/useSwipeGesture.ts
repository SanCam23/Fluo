import { useState, useRef, useCallback } from 'react';

/**
 * Calculates clamped offset with elastic rubber-band resistance beyond maxDistance.
 */
export function computeSwipeOffset(
  diffX: number,
  maxDistance = 110,
  resistanceFactor = 0.35
): number {
  if (diffX < 0) {
    return diffX < -maxDistance
      ? -maxDistance + (diffX + maxDistance) * resistanceFactor
      : diffX;
  }
  return diffX > maxDistance
    ? maxDistance + (diffX - maxDistance) * resistanceFactor
    : diffX;
}

export interface UseSwipeGestureOptions {
  /**
   * Minimum distance in pixels required to trigger swipe action on touch end.
   * Default: 80
   */
  threshold?: number;
  /**
   * Distance at which elastic resistance kicks in.
   * Default: 110
   */
  maxDistance?: number;
  /**
   * Resistance damping factor applied beyond maxDistance (0 < factor < 1).
   * Default: 0.35
   */
  resistanceFactor?: number;
  /**
   * Callback fired when swiped left past the threshold.
   */
  onSwipeLeft?: () => void;
  /**
   * Callback fired when swiped right past the threshold.
   */
  onSwipeRight?: () => void;
  /**
   * When true, touch tracking is disabled.
   */
  disabled?: boolean;
}

export interface UseSwipeGestureReturn {
  offsetX: number;
  setOffsetX: React.Dispatch<React.SetStateAction<number>>;
  isSwiping: boolean;
  isPastLeftThreshold: boolean;
  isPastRightThreshold: boolean;
  touchHandlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
  resetSwipe: () => void;
}

/**
 * Standardized Touch Swipe Gesture hook with elastic resistance and threshold actions.
 * Used across swipeable transaction items, asset cards, and interactive lists.
 */
export function useSwipeGesture({
  threshold = 80,
  maxDistance = 110,
  resistanceFactor = 0.35,
  onSwipeLeft,
  onSwipeRight,
  disabled = false,
}: UseSwipeGestureOptions = {}): UseSwipeGestureReturn {
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);
  const currentOffset = useRef(0);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      const touch = e.touches[0];
      startX.current = touch.clientX;
      startY.current = touch.clientY;
      isHorizontal.current = null;
      currentOffset.current = 0;
      setIsSwiping(true);
    },
    [disabled]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      const touch = e.touches[0];
      const diffX = touch.clientX - startX.current;
      const diffY = touch.clientY - startY.current;

      // Lock direction on first significant movement (>6px)
      if (isHorizontal.current === null) {
        if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
          isHorizontal.current = Math.abs(diffX) > Math.abs(diffY);
        }
      }

      if (isHorizontal.current) {
        const clamped = computeSwipeOffset(diffX, maxDistance, resistanceFactor);
        currentOffset.current = clamped;
        setOffsetX(clamped);
      }
    },
    [disabled, maxDistance, resistanceFactor]
  );

  const handleTouchEnd = useCallback(() => {
    if (disabled) return;
    setIsSwiping(false);
    const offset = currentOffset.current;

    if (offset <= -threshold) {
      onSwipeLeft?.();
    } else if (offset >= threshold) {
      onSwipeRight?.();
    }

    setOffsetX(0);
    currentOffset.current = 0;
    isHorizontal.current = null;
  }, [disabled, threshold, onSwipeLeft, onSwipeRight]);

  const resetSwipe = useCallback(() => {
    setOffsetX(0);
    currentOffset.current = 0;
    setIsSwiping(false);
    isHorizontal.current = null;
  }, []);

  return {
    offsetX,
    setOffsetX,
    isSwiping,
    isPastLeftThreshold: offsetX <= -threshold,
    isPastRightThreshold: offsetX >= threshold,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    resetSwipe,
  };
}
