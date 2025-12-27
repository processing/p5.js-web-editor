import React, { ReactNode } from 'react';

interface AdmonitionProps {
  children?: ReactNode;
  title: string;
}

export const Admonition = ({ children, title }: AdmonitionProps) => (
  <div className="admonition">
    <p className="admonition__title">
      <strong>{title}</strong>
    </p>
    {children}
  </div>
);
