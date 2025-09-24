// This is used to compare which technologies should appear in which review positions for different directorates
// It is used in review.test.js
// Technologies are identified by their id field in radarData.js
export const reviewPositionCases = {
    'Digital Services': {
        'adopt': [
            'test-aws',
            'test-gcp',
            'test-javascript-typescript',
        ],
        'trial': [
            'test-r',
        ],
        'assess': [

        ],
        'hold': [

        ],
        'review': [
            'test-Csharp',
        ],
        'ignore': [

        ],
    },
    'Data Science': {
        'adopt': [
            'test-aws',
            'test-gcp',
            'test-javascript-typescript',
            'test-r',
            'test-Csharp',
        ],
        'trial': [

        ],
        'assess': [

        ],
        'hold': [

        ],
        'review': [
            
        ],
        'ignore': [

        ],
    },
    'DGO': {
        'adopt': [
            'test-aws',
            'test-gcp',
            'test-javascript-typescript',
        ],
        'trial': [
            'test-r',
        ],
        'assess': [

        ],
        'hold': [

        ],
        'review': [
            'test-Csharp',
        ],
        'ignore': [

        ],
    },
}