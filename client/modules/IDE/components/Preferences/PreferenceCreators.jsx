import { useTranslation } from 'react-i18next';

export const optionsOnOff = (name) => {
  const { t, i18n } = useTranslation();
  return [
    {
      value: true, label: t('Preferences.On'), ariaLabel: `${name} on`, name: `${name}`, id: `${name}-on`.replace(' ', '-')
    },
    {
      value: false, label: t('Preferences.Off'), ariaLabel: `${name} off`, name: `${name}`, id: `${name}-off`.replace(' ', '-')
    }
  ];
};

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
