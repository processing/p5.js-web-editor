import React, { ReactElement, useMemo } from 'react';

export type TooltipProps = {
  content: string;
  noDelay?: boolean;
  children: ReactElement;
};

export function Tooltip({ content, noDelay = false, children }: TooltipProps) {
  const tooltipClasses = useMemo(() => {
    const existingClassName = children.props?.className || '';
    return [
      existingClassName,
      'tooltipped',
      'tooltipped-n',
      noDelay && 'tooltipped-no-delay'
    ]
      .filter(Boolean)
      .join(' ');
  }, [children.props?.className, noDelay]);

  const childProps = useMemo(
    () => ({
      'aria-label': content,
      className: tooltipClasses
    }),
    [content, tooltipClasses]
  );

  return (
    <span className="tooltip-wrapper">
      {React.cloneElement(children, childProps)}
    </span>
  );
}
