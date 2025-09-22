// Radar data used to draw the tech radar
export const radarData = {
  title: 'ONS Tech Test Radar',
  entries: [
    {
      id: 'test-aws',
      title: 'AWS',
      quadrant: '4',
      description: 'Infrastructure',
      timeline: [
        {
          moved: 0,
          ringId: 'review',
          date: '2025-07-01 00:00:00',
          description: 'Added for review from tech audit (Infrastructure)',
        },
        {
          moved: 4,
          ringId: 'adopt',
          date: '2025-09-11 00:00:00',
          description:
            'Technology Radar Update: Amazon Web Services (AWS) Categorised as **ADOPT**\n\n**Amazon Web Services (AWS)**.',
          author: 'test@ons.gov.uk',
        },
      ],
    },
    {
      id: 'test-gcp',
      title: 'GCP',
      quadrant: '4',
      description: 'Infrastructure',
      timeline: [
        {
          moved: 0,
          ringId: 'review',
          date: '2025-07-01 00:00:00',
          description: 'Added for review from tech audit (Infrastructure)',
        },
        {
          moved: 4,
          ringId: 'adopt',
          date: '2025-09-11 00:00:00',
          description:
            'Technology Radar Update: Google Cloud Platform (GCP) Categorised as **ADOPT**\n\n**Amazon Web Services (AWS)**.',
          author: 'test@ons.gov.uk',
        },
      ],
    },
    {
      id: 'test-javascript-typescript',
      title: 'Javascript/TypeScript',
      quadrant: '1',
      description: 'Languages',
      timeline: [
        {
          moved: 0,
          ringId: 'review',
          date: '2025-07-01 00:00:00',
          description: 'Added for review from tech audit (Languages)',
        },
        {
          moved: 4,
          ringId: 'adopt',
          date: '2025-09-17 00:00:00',
          description:
            'Technology Radar Update: Javascript/TypeScript Categorised as **ADOPT**\n.',
          author: 'test@ons.gov.uk',
        },
      ],
    },
    {
      id: 'test-java',
      title: 'Java',
      quadrant: '1',
      description: 'Languages',
      timeline: [
        {
          moved: 0,
          ringId: 'review',
          date: '2025-07-01 00:00:00',
          description: 'Added for review from tech audit (Languages)',
        },
        {
          moved: 1,
          ringId: 'hold',
          date: '2025-09-17 00:00:00',
          description:
            'Technology Radar Update: Java Categorised as **HOLD**\n.',
          author: 'test@ons.gov.uk',
        },
      ],
    },
  ],
  quadrants: [
    {
      id: '1',
      name: 'Languages',
    },
    {
      id: '2',
      name: 'Frameworks',
    },
    {
      id: '3',
      name: 'Supporting Tools',
    },
    {
      id: '4',
      name: 'Infrastructure',
    },
  ],
  rings: [
    {
      id: 'adopt',
      name: 'ADOPT',
      color: '#008a00',
    },
    {
      id: 'trial',
      name: 'TRIAL',
      color: '#cb00b4',
    },
    {
      id: 'assess',
      name: 'ASSESS',
      color: '#0069e5',
    },
    {
      id: 'hold',
      name: 'HOLD',
      color: '#de001a',
    },
  ],
};
