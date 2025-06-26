import React, { useState, useRef, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import '../../styles/components/MultiSelect.css';

const MultiSelect = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  isDisabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = event => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputClick = () => {
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleOptionClick = option => {
    const isSelected = value.some(v => v.value === option.value);
    let newValue;
    if (isSelected) {
      newValue = value.filter(v => v.value !== option.value);
    } else {
      newValue = [...value, option];
    }
    onChange(newValue);
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handleRemoveValue = (optionValue, e) => {
    e.stopPropagation();
    const newValue = value.filter(v => v.value !== optionValue);
    onChange(newValue);
  };

  const handleKeyDown = event => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.focus();
    } else if (event.key === 'ArrowDown' && !isOpen) {
      setIsOpen(true);
      event.preventDefault();
    } else if (event.key === 'ArrowDown' && isOpen) {
      const firstOption = dropdownRef.current?.querySelector(
        '.multi-select-option'
      );
      if (firstOption) {
        firstOption.focus();
        event.preventDefault();
      }
    }
  };

  const handleOptionKeyDown = (event, option) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleOptionClick(option);
      event.preventDefault();
    } else if (event.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.focus();
    } else if (event.key === 'ArrowDown') {
      const nextOption = event.target.nextElementSibling;
      if (nextOption) {
        nextOption.focus();
      }
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      const prevOption = event.target.previousElementSibling;
      if (prevOption) {
        prevOption.focus();
      } else {
        inputRef.current?.focus();
        setIsOpen(true);
      }
      event.preventDefault();
    }
  };

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`multi-select`} ref={containerRef}>
      <div
        className={`multi-select-control ${isOpen ? 'active' : ''}`}
        onClick={handleInputClick}
      >
        <div className="multi-select-values">
          {value.map(v => (
            <div key={v.value} className="multi-select-value">
              {v.label}
              <button
                onClick={e => handleRemoveValue(v.value, e)}
                aria-label={`Remove ${v.label}`}
              >
                <IoClose size={14} />
              </button>
            </div>
          ))}
          <input
            ref={inputRef}
            className="multi-select-input"
            value={searchTerm || ''}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ''}
            disabled={isDisabled}
            type="text"
            aria-label="Search options"
            aria-autocomplete="list"
            aria-controls="multi-select-dropdown"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            role="combobox"
          />
        </div>
      </div>
      {isOpen && filteredOptions.length > 0 && (
        <div
          ref={dropdownRef}
          id="multi-select-dropdown"
          className="multi-select-dropdown"
          role="listbox"
          aria-label="Available options"
          tabIndex="0"
        >
          {filteredOptions.map(option => (
            <div
              key={option.label + option.value}
              className={`multi-select-option ${
                value.some(v => v.value === option.value) ? 'selected' : ''
              }`}
              onClick={() => handleOptionClick(option)}
              onKeyDown={e => handleOptionKeyDown(e, option)}
              role="option"
              aria-selected={value.some(v => v.value === option.value)}
              tabIndex="0"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
