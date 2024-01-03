import type React from "react";
import { useCallback, useMemo, useRef, useState } from "react";

type SeparatorProps = React.ComponentPropsWithoutRef<"hr">;
type Resizable = {
  position: number;
  isDragging: boolean;
  separatorProps: SeparatorProps;
  handleClick: (e: React.MouseEvent | React.TouchEvent, isCollapsed: boolean) => void;
};
type UseResizableProps = {
  axis: "x" | "y";
  containerRef?: React.RefObject<HTMLElement>;
  disabled?: boolean;
  initial?: number;
  min?: number;
  max?: number;
  reverse?: boolean;
};

export type ResizableProps = UseResizableProps & {
  children: (props: Resizable) => JSX.Element;
};

const useResizable = ({
  axis,
  disabled = false,
  initial = 0,
  min = 0,
  max = Infinity,
  reverse,
  containerRef,
}: UseResizableProps): Resizable => {
  const isResizing = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(Math.min(Math.max(initial, min), max));

  const ariaProps = useMemo<SeparatorProps>(
    () => ({
      role: "separator",
      "aria-valuenow": position,
      "aria-valuemin": min,
      "aria-valuemax": max,
      "aria-orientation": axis === "x" ? "vertical" : "horizontal",
      "aria-disabled": disabled,
    }),
    [axis, disabled, max, min, position],
  );

  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isResizing.current) return;
      if (disabled) return;
      e.stopPropagation();
      e.preventDefault();
      const currentPosition = (() => {
        if (axis === "x") {
          const x = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
          if (containerRef?.current) {
            const containerNode = containerRef.current;
            const { left, width } = containerNode.getBoundingClientRect();
            return reverse ? left + width - x : x - left;
          }
          return reverse ? document.body.offsetWidth - x : x;
        } else {
          const y = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
          if (containerRef?.current) {
            const containerNode = containerRef.current;
            const { top, height } = containerNode.getBoundingClientRect();
            return reverse ? top + height - y : y - top;
          }
          return reverse ? document.body.offsetHeight - y : y;
        }
      })();

      if (min <= currentPosition && currentPosition <= max) {
        setPosition(currentPosition);
      }
    },
    [axis, disabled, max, min, reverse, containerRef],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent | React.TouchEvent, isCollapsed: boolean) => {
      if (disabled) return;
      e.stopPropagation();
      e.preventDefault();
      if (!isCollapsed) {
        setPosition(4);
      } else {
        setPosition(min);
      }
    },
    [disabled, min],
  );

  const handleUp = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (disabled) return;
      e.stopPropagation();
      isResizing.current = false;
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("mouseup", handleUp);
      document.removeEventListener("touchend", handleUp);
    },
    [disabled, handleMove],
  );

  const handleDown = useCallback<any>(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;
      e.stopPropagation();
      isResizing.current = true;
      setIsDragging(true);
      document.addEventListener("mousemove", handleMove);
      document.addEventListener("touchmove", handleMove);
      document.addEventListener("mouseup", handleUp);
      document.addEventListener("touchend", handleUp);
    },
    [disabled, handleMove, handleUp],
  );
  return {
    position,
    isDragging,
    separatorProps: {
      ...ariaProps,
      onMouseDown: handleDown,
      onTouchStart: handleDown,
    },
    handleClick,
  };
};

export default useResizable;
