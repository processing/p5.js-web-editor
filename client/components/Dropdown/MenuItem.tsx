import React from 'react';
import { ButtonOrLink, ButtonOrLinkProps } from '../../common/ButtonOrLink';

// TODO: combine with NavMenuItem

export interface MenuItemProps extends ButtonOrLinkProps {
  /**
   * Provides a way to deal with optional items.
   */
  hideIf?: boolean;
  value?: string;
}

export function MenuItem({ hideIf = false, ...rest }: MenuItemProps) {
  if (hideIf) {
    return null;
  }

  return (
    <li role="menuitem">
      <ButtonOrLink {...rest} />
    </li>
  );
}
