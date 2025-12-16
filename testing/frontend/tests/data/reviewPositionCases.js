// This is used to compare which technologies should appear in which review positions for different directorates
// It is used in review.test.js
// Technologies are identified by their id field in radarData.js
export const reviewPositionCases = {
  'Digital Services (DS)': {
    adopt: ['test-aws', 'test-gcp', 'test-javascript-typescript'],
    trial: ['test-r'],
    assess: [],
    hold: [],
    review: ['test-Csharp'],
    ignore: [],
  },
  'Data Science Campus (DSC)': {
    adopt: [
      'test-aws',
      'test-gcp',
      'test-javascript-typescript',
      'test-r',
      'test-Csharp',
    ],
    trial: [],
    assess: [],
    hold: [],
    review: [],
    ignore: [],
  },
  'Data Growth and Operations (DGO)': {
    adopt: [
      'test-aws',
      'test-gcp',
      'test-pl/sql',
      'test-javascript-typescript',
    ],
    trial: ['test-r'],
    assess: [],
    hold: [],
    review: ['test-Csharp'],
    ignore: [],
  },
};
