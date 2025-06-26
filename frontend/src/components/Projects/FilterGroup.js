import React from 'react';
import { IoCheckmarkSharp, IoChevronForward } from 'react-icons/io5';

/**
 * FilterGroup component - A reusable filter group with an accordion toggle and checkboxes
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Title of the filter group
 * @param {string} props.sectionKey - The key used to identify this section in state
 * @param {boolean} props.isExpanded - Whether the section is expanded
 * @param {Function} props.toggleSection - Function to toggle section expanded state
 * @param {Array} props.items - Array of items to display as checkboxes
 * @param {Array} props.selectedItems - Array of currently selected items
 * @param {Function} props.onItemChange - Function called when an item is selected/deselected
 * @returns {JSX.Element} - The rendered filter group component
 */
const FilterGroup = ({
  title,
  sectionKey,
  isExpanded,
  toggleSection,
  items,
  selectedItems = [],
  onItemChange,
}) => {
  return (
    <div className="filter-group">
      <div
        className="filter-group-title filter-accordion-header"
        onClick={() => toggleSection(sectionKey)}
      >
        <span>{title}</span>
        <IoChevronForward
          className={`accordion-icon ${isExpanded ? 'expanded' : ''}`}
        />
      </div>
      {isExpanded && (
        <div className="filter-checkbox-group">
          {items.map(item => (
            <label key={item} className="filter-checkbox-label">
              <div className="custom-checkbox">
                {selectedItems.includes(item) && (
                  <IoCheckmarkSharp className="checkbox-icon" />
                )}
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={selectedItems.includes(item)}
                onChange={() => onItemChange(sectionKey, item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterGroup;
