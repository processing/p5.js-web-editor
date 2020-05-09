import React from 'react';
import { action } from '@storybook/addon-actions';
import { boolean, text } from '@storybook/addon-knobs';

import Button from './Button';

export default {
  title: 'Common/Button',
  component: Button
};

export const AllFeatures = () => (
  <Button
    disabled={boolean('disabled', false)}
    type="submit"
    label={text('label', 'submit')}
  >
    {text('children', 'this is the button')}
  </Button>
);

export const SubmitButton = () => (
  <Button type="submit" label="submit">This is a submit button</Button>
);

export const DefaultTypeButton = () => <Button label="login" onClick={action('onClick')}>Log In</Button>;

export const DisabledButton = () => <Button disabled label="login" onClick={action('onClick')}>Log In</Button>;

export const AnchorButton = () => (
  <Button href="http://p5js.org" label="submit">Actually an anchor</Button>
);

export const ReactRouterLink = () => (
  <Button to="./somewhere" label="submit">Actually a Link</Button>
);

export const ButtonWithIconBefore = () => (
  <Button iconBeforeName={Button.iconNames.Github}>Create</Button>
);

export const ButtonWithIconAfter = () => (
  <Button iconAfterName={Button.iconNames.Github}>Create</Button>
);

export const InlineButtonWithIconAfter = () => (
  <Button kind={Button.kinds.inline} iconAfterName={Button.iconNames.SortArrowDown}>File name</Button>
);

export const InlineIconOnlyButton = () => (
  <Button kind={Button.kinds.inline} iconAfterName={Button.iconNames.Plus} label="Add to collection" />
);
