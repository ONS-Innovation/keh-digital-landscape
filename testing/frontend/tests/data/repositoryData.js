const mockRepositoryData = {
  repositories: [
    {
      name: 'sample-project-4',
      url: 'https://github.com/ONSDigital/sample-project-4',
      visibility: 'PUBLIC',
      is_archived: false,
      last_commit: '2025-11-20T10:30:00Z',
      technologies: {
        languages: [
          { name: 'Fortran', size: 70000, percentage: 70 },
          { name: 'Assembly', size: 20000, percentage: 20 },
          { name: 'PHP', size: 10000, percentage: 10 },
        ],
      },
    },
  ],
  stats: {
    total_repos: 1,
    total_private_repos: 0,
    total_public_repos: 1,
    total_internal_repos: 0,
  },
  language_statistics: {},
  metadata: {
    last_updated: '2025-11-26T00:00:00Z',
    requested_repos: ['sample-project-4'],
    found_repos: ['sample-project-4'],
  },
};

const emptyRepositoryData = {
  repositories: [],
  stats: {
    total_repos: 0,
    total_private_repos: 0,
    total_public_repos: 0,
    total_internal_repos: 0,
  },
  language_statistics: {},
  metadata: {
    last_updated: '',
    requested_repos: [],
  },
};

export { mockRepositoryData, emptyRepositoryData };
