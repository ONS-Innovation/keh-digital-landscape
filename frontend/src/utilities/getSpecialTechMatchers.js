/**
 * specialTechMatchers constant to store the special technology matchers.
 * This object can be extended to add more special cases.
 * @type {Object} - The special technology matchers.
 */
export const specialTechMatchers = {
  AWS: item => {
    const lowered = item.trim().toLowerCase();
    return lowered.includes('aws') || lowered.includes('amazon');
  },
  GCP: item => {
    const excluded_gcp = ['google meet', 'google docs'];
    const lowered = item.trim().toLowerCase();
    if (excluded_gcp.includes(lowered)) return false;
    return lowered.includes('google') || lowered.includes('gcp');
  },
  'Javascript/TypeScript': item => {
    const lowered = item.trim().toLowerCase();
    return lowered === 'javascript' || lowered === 'typescript';
  },
  SAS: item => {
    const lowered = item.trim().toLowerCase();
    return lowered === 'base sas' || lowered === 'sas';
  },
  'HCL (Terraform)': item => {
    const lowered = item.trim().toLowerCase();
    return (
      lowered === 'hcl (terraform)' ||
      lowered === 'hcl' ||
      lowered === 'terraform'
    );
  },
};
