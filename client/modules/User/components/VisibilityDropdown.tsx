import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LockIcon from '../../../images/lock.svg';
import EarthIcon from '../../../images/earth.svg';
import CheckmarkIcon from '../../../images/checkmark.svg';

export interface VisibilityDropdownProps {
  sketch: {
    id: string;
    name: string;
    visibility: string;
  };
  onVisibilityChange: (
    sketchId: string,
    sketchName: string,
    newVisibility: string
  ) => void;
  location?: string;
}
export const VisibilityDropdown = ({
  sketch,
  onVisibilityChange,
  location = 'sketchlist'
}: VisibilityDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<null | HTMLDivElement>(null);

  const { t } = useTranslation();

  const visibilityOptions = [
    {
      value: 'Public',
      label: t('Visibility.Public.Label'),
      icon: <EarthIcon className="visibility-icon" />,
      description: t('Visibility.Public.Description')
    },
    {
      value: 'Private',
      label: t('Visibility.Private.Label'),
      icon: <LockIcon className="visibility-icon" />,
      description: t('Visibility.Private.Description')
    }
  ];

  const currentVisibility =
    visibilityOptions.find((option) => option.value === sketch.visibility) ||
    visibilityOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (
        dropdownRef.current &&
        target &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVisibilitySelect = (newVisibility: string) => {
    if (newVisibility !== sketch.visibility) {
      onVisibilityChange(sketch.id, sketch.name, newVisibility);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    visibility: string
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleVisibilitySelect(visibility);
    }
  };

  return (
    <div className="visibility-dropdown" ref={dropdownRef}>
      <button
        className={`visibility-dropdown__trigger ${
          location === 'toolbar' ? 'visibility-dropdown__trigger-toolbar' : ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Change visibility. Currently ${currentVisibility.label}`}
      >
        {currentVisibility.icon}
        <span className="visibility-label">{currentVisibility.label}</span>
      </button>

      {isOpen && (
        <div className="visibility-dropdown__menu">
          {visibilityOptions.map((option) => (
            <div
              key={option.value}
              className={`visibility-dropdown__option ${
                option.value === sketch.visibility ? 'selected' : ''
              }`}
              onClick={() => handleVisibilitySelect(option.value)}
              onKeyDown={(e) => handleKeyDown(e, option.value)}
              role="button"
              tabIndex={0}
            >
              <div className="visibility-option__main">
                {option.icon}
                <span className="visibility-option__label">{option.label}</span>
                {option.value === sketch.visibility && (
                  <CheckmarkIcon focusable="false" aria-hidden="true" />
                )}
              </div>
              <div
                className={`visibility-option__description ${
                  option.value === sketch.visibility ? 'selected' : ''
                }`}
              >
                {option.description}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
