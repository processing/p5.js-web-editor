export const optionsOnOff = (name, onLabel = 'On', offLabel = 'Off') => [
  {
    value: true, label: onLabel, ariaLabel: `${name} on`, name: `${name}`, id: `${name}-on`.replace(' ', '-')
  },
  {
    value: false, label: offLabel, ariaLabel: `${name} off`, name: `${name}`, id: `${name}-off`.replace(' ', '-')
  },
];

export const optionsPickOne = (name, ...options) => options.map(option => ({
  value: option,
  label: option,
  ariaLabel: `${option} ${name} on`,
  name: `${option} ${name}`,
  id: `${option}-${name}-on`.replace(' ', '-')
}));

const nameToValueName = x => (x && x.toLowerCase().replace(/#|_|-/g, ' '));

// preferenceOnOff: name, value and onSelect are mandatory. propname is optional
export const preferenceOnOff = (name, value, onSelect, propname) => ({
  title: name,
  value,
  options: optionsOnOff(propname || nameToValueName(name)),
  onSelect
});
