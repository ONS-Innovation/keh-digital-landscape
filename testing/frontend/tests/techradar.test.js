import { test, expect } from 'playwright/test';

// Data
const radarData = {
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

const csvData = [
  {
    Project: 'AWS Project',
    Project_Short: 'AWSP',
    Developed: 'In House',
    Technical_Contact: 'test@ons.gov.uk (Grade 7)',
    Delivery_Manager: 'test@ons.gov.uk (HEO)',
    Language_Main: 'Python',
    Language_Others: 'Javascript',
    Language_Frameworks: 'Python Flask',
    Hosted: 'Cloud',
    Architectures: 'AWS',
    Datastores: 'AWS S3 Bucket',
    Infrastructure:
      'AWS Elastic Container Registry (ECR); AWS Elastic Container Service (ECS)',
  },
  {
    Project: 'Another Project - GCP and AWS services',
    Project_Short: 'AWSPGCP',
    Developed: 'In House',
    Technical_Contact: 'test@ons.gov.uk (Grade 7)',
    Delivery_Manager: 'test@ons.gov.uk (HEO)',
    Language_Main: 'Python',
    Language_Others: 'Javascript',
    Language_Frameworks: 'Python Flask',
    Hosted: 'Cloud',
    Architectures: 'GCP',
    Datastores: 'AWS Aurora',
    Infrastructure:
      'Amazon Simple Queue Service (SQS); Amazon Simple Notification Service (SNS)',
  },
  {
    Project: 'GCP Project',
    Project_Short: 'GCPP',
    Developed: 'In House',
    Technical_Contact: 'test@ons.gov.uk (Grade 7)',
    Delivery_Manager: 'test@ons.gov.uk (HEO)',
    Language_Main: 'Python',
    Language_Others: 'Javascript',
    Language_Frameworks: 'Python Flask',
    Hosted: 'Cloud',
    Architectures: 'GCP',
    Datastores: 'GCP BigQuery',
    Infrastructure: 'Compute Engine (CE); Google Kubernetes Engine (GKE)',
  },
  {
    Project: 'AWS with GCP services',
    Project_Short: 'AWSPGCP2',
    Developed: 'In House',
    Technical_Contact: 'test@ons.gov.uk (Grade 7)',
    Delivery_Manager: 'test@ons.gov.uk (HEO)',
    Language_Main: 'Python',
    Language_Others: 'Javascript',
    Language_Frameworks: 'Python Flask',
    Hosted: 'Cloud',
    Architectures: 'AWS',
    Datastores: 'Google AlloyDB',
    Infrastructure: 'Google Cloud Run; Google Kubernetes Engine (GKE)',
  },
  {
    Project: 'Oracle Project',
    Project_Short: 'ORCLP',
    Developed: 'In House',
    Technical_Contact: 'test@ons.gov.uk (Grade 7)',
    Delivery_Manager: 'test@ons.gov.uk (HEO)',
    Language_Main: 'Java',
    Language_Others: 'PL/SQL',
    Language_Frameworks: 'Spring',
    Hosted: 'Cloud',
    Architectures: 'Oracle',
    Datastores: 'Oracle DB',
    Infrastructure: 'Oracle Cloud Infrastructure (OCI)',
  },
];

// Function to intercept and mock the API call
const interceptAPICall = async ({ page }) => {
  // Function to intercept and mock the API JSON call
  const interceptAPIJsonCall = async ({ page }) => {
    // Intercept and mock the teams API response with teamsDummyData
    await page.route('**/api/tech-radar/json', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(radarData),
      });
    });
  };

  // Function to intercept and mock the API JSON call
  const interceptAPICSVCall = async ({ page }) => {
    // Intercept and mock the teams API response with teamsDummyData
    await page.route('**/api/csv', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(csvData),
      });
    });
  };
  await interceptAPIJsonCall({ page });
  await interceptAPICSVCall({ page });
  await page.goto('http://localhost:3000/radar');

  // Clear all cookies
  await page.context().clearCookies();

  // Set a dummy authentication cookie to simulate logged-in user
  await page.context().addCookies([
    {
      name: 'githubUserToken',
      value: 'dummy-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
  await page.reload();
};

const cloudBlipCases = [
  {
    name: 'AWS',
    blipNumber: '1',
    heading: 'AWS',
    projects: [
      'AWS Project',
      'Another Project - GCP and AWS services',
      'AWS with GCP services',
    ],
    projectsCountText: '3 projects',
  },
  {
    name: 'GCP',
    blipNumber: '2',
    heading: 'GCP',
    projects: [
      'GCP Project',
      'Another Project - GCP and AWS services',
      'AWS with GCP services',
    ],
    projectsCountText: '3 projects',
  },
];

test.describe('Check projects available under cloud infrastructure', () => {
  for (const {
    name,
    blipNumber,
    heading,
    projects,
    projectsCountText,
  } of cloudBlipCases) {
    test(`Check projects under ${name}`, async ({ page }) => {
      await interceptAPICall({ page });
      // await expect(page).toHaveTitle(/Digital Landscape - ONS/);

      // await page.goto('http://localhost:3000/radar/');

      const radarInfrastructureText = await page.locator('text', {
        hasText: 'Infrastructure',
      });
      const blip = await page.locator('text', { hasText: blipNumber });
      await expect(radarInfrastructureText).toHaveClass(/quadrant-label-text/);
      await expect(blip).toHaveClass(/blip-number/);

      await page
        .locator('g')
        .filter({ hasText: blipNumber })
        .locator('circle')
        .first()
        .click();

      const blipInfo = page.getByRole('heading', { name: heading });
      const noOfProjects = page.getByText(projectsCountText);

      await expect(blipInfo).toBeVisible();
      await expect(noOfProjects).toBeVisible();

      for (const project of projects) {
        await expect(page.getByText(project)).toBeVisible();
      }
    });
  }

  test('Oracle Project does not appear under AWS or GCP blips', async ({
    page,
  }) => {
    await interceptAPICall({ page });

    // Click AWS blip
    await page
      .locator('g')
      .filter({ hasText: '1' })
      .locator('circle')
      .first()
      .click();
    await expect(page.getByText('Oracle Project')).not.toBeVisible();

    // Click GCP blip
    await page
      .locator('g')
      .filter({ hasText: '2' })
      .locator('circle')
      .first()
      .click();
    await expect(page.getByText('Oracle Project')).not.toBeVisible();
  });

  test('No Oracle blip is present', async ({ page }) => {
    await interceptAPICall({ page });

    // Try to find a blip with text 'Oracle' or blip number '3' (if that would be Oracle)
    const oracleBlip = page.locator('text', { hasText: 'Oracle' });
    await expect(oracleBlip).toHaveCount(0);

    // Or, if you use blip numbers:
    const blip3 = page.locator('text', { hasText: '3' });
    await expect(blip3).toHaveCount(0);
  });
});
