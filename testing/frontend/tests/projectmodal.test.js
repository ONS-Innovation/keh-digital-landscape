// ProjectModal.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectModal from './ProjectModal';

// Minimal mocks for imported hooks/utilities (no repo fetching in these tests)
jest.mock('../../utilities/getTechnologyStatus', () => ({
  useTechnologyStatus: () => () => 'adopt',
}));
jest.mock('../../utilities/getRepositoryData', () => ({
  fetchRepositoryData: jest.fn(),
}));

const renderModal = (overrides = {}) => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    project: {
      Project: 'a',
      Programme: 'a',
      Programme_Short: 'a',
      Environments: '',              // this should be "no data captured"
      Infrastructure: 'Kubernetes',
      CICD: 'GitHub Actions',
      Cloud_Services: 'AWS',
      Containers: 'Docker',
      Hosted: 'On-prem',
      Architectures: 'Microservices',
      // General group: check special-case renderer
      Miscellaneous: '',
    },
    renderTechnologyList: (val) => <span data-testid="tech-list">{String(val)}</span>,
    onTechClick: jest.fn(),
    ...overrides,
  };

  return render(<ProjectModal {...defaultProps} />);
};

describe('ProjectModal "No Data Captured" UI', () => {
  test('renders "No Data Captured" for empty standard fields (e.g., Environments)', () => {
    renderModal();

    // Group title is visible (content is expanded by default in this component)
    expect(screen.getByText('Infrastructure & Deployment')).toBeInTheDocument();

    // Field label
    expect(screen.getByText('Environments:')).toBeInTheDocument();

    // Fallback text for empty value
    expect(screen.getByText(/No Data Captured/i)).toBeInTheDocument();
  });

  test('renders actual content when field has data', () => {
    renderModal();

    // Another field in the same group with real data should show its value, not the fallback
    expect(screen.getByText('Infrastructure:')).toBeInTheDocument();
    expect(screen.getByText(/Kubernetes/i)).toBeInTheDocument();
  });

  test('shows "No Data Captured" for the special Miscellaneous block when empty', () => {
    renderModal();

    expect(screen.getByText('General Information')).toBeInTheDocument();
    expect(screen.getByText('Miscellaneous:')).toBeInTheDocument();
    expect(screen.getAllByText(/No Data Captured/i).length).toBeGreaterThan(1);
  });

  test('search still shows the field with "No Data Captured" when searching by its label', async () => {
    renderModal();
    const user = userEvent.setup();

    // Search input in the header
    const search = screen.getByPlaceholderText(/Search project details/i);
    await user.type(search, 'environments'); // matches field label

    // The "Environments:" field should remain visible and still show the fallback text
    expect(screen.getByText('Environments:')).toBeInTheDocument();
    expect(screen.getByText(/No Data Captured/i)).toBeInTheDocument();
  });

  test('accordion behavior: field & fallback hidden when the group is collapsed', async () => {
    renderModal();
    const user = userEvent.setup();

    // Collapse the Infrastructure group
    const infraHeader = screen.getByText('Infrastructure & Deployment');
    await user.click(infraHeader);

    // After collapsing, the label/fallback shouldn’t be visible
    expect(screen.queryByText('Environments:')).not.toBeInTheDocument();
    expect(screen.queryByText(/No Data Captured/i)).not.toBeInTheDocument();

    // Expand again
    await user.click(infraHeader);
    expect(screen.getByText('Environments:')).toBeInTheDocument();
    expect(screen.getByText(/No Data Captured/i)).toBeInTheDocument();
  });
});
