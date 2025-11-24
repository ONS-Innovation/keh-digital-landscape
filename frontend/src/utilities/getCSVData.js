import { toast } from 'react-hot-toast';
import { useData } from '../contexts/dataContext';
import customFetch from './customFetch';

/**
 * fetchCSVFromS3 function to fetch the CSV data from the S3 bucket.
 * Falls back to local CSV if S3 fetch fails.
 *
 * @returns {Promise<Object>} - The CSV data.
 */
export const fetchCSVFromS3 = async () => {
  try {
    const response = await customFetch(`/api/csv`);
    if (!response.ok) {
      throw new Error('Failed to fetch CSV data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading CSV data:', error);
    try {
      const response = await fetch('/tech_radar/onsTechData.csv');
      if (!response.ok) {
        throw new Error('Failed to fetch local CSV');
      }
      const csvText = await response.text();
      const rows = csvText.split('\n');
      const headers = rows[0].split(',');
      const data = rows.slice(1).map(row => {
        const values = row.split(',');
        return headers.reduce((obj, header, i) => {
          obj[header] = values[i];
          return obj;
        }, {});
      });
      return data;
    } catch (fallbackError) {
      console.error('Error loading project data:', fallbackError);
      toast.error('Failed to load project data.');
      return null;
    }
  }
};

/**
 * Hook wrapper for fetchCSVFromS3
 * @returns {Promise<Object>} - The CSV data
 */
export const useCSVData = () => {
  const { getCsvData } = useData();
  return getCsvData;
};
