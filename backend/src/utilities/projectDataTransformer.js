/**
 * Transforms a project object from the raw JSON format to the CSV format.
 * @param {Object} project - The raw project data object
 * @param {Object} reverseDependencyMap - Map of project names to projects that depend on them
 * @returns {Object} The transformed project data in CSV format
 */
function transformProjectToCSVFormat(project, reverseDependencyMap = {}) {
  // Find technical contact with ONS email
  const technicalContactUser = project.user.find(
    u =>
      u.roles.includes('Technical Contact') &&
      (u.email?.includes('@ons.gov.uk') || u.email?.includes('@ext.ons.gov.uk'))
  );

  const envLabels = {
  dev: 'DEV',
  int: 'INT',
  uat: 'UAT',
  preprod: 'PRE-PROD (STAGING)',
  prod: 'PROD',
  postprod: 'POST-PROD',
  };
  // Format technical contact string if found
  const technicalContact = technicalContactUser
    ? `${technicalContactUser.email} (${technicalContactUser.grade})`
    : '';

  // Find delivery manager with ONS email
  const deliveryManagerUser = project.user.find(
    u =>
      u.roles.includes('Delivery Manager') &&
      (u.email?.includes('@ons.gov.uk') || u.email?.includes('@ext.ons.gov.uk'))
  );

  // Format delivery manager string if found
  const deliveryManager = deliveryManagerUser
    ? `${deliveryManagerUser.email} (${deliveryManagerUser.grade})`
    : '';

  // Get main languages and others as comma-separated strings
  const mainLanguages = project.architecture.languages.main.join('; ');
  const otherLanguages = project.architecture.languages.others.join('; ');
  const frameworks = project.architecture.frameworks.others.join('; ');

  // Get source control details
  const sourceControl = project.source_control[0]?.type || '';
  const developed =
    project.developed[1] != ''
      ? `${project.developed[0]} with ${project.developed.slice(1).join(', ')}`
      : project.developed[0];

  // Get project name for reverse dependency lookup
  const projectName =
    project.details[0]?.name || project.details[0]?.short_name || '';
  const listedAsDependency = reverseDependencyMap[projectName] || [];

  // Transform to match desired CSV structure
  return {
    Project: project.details[0]?.name || '',
    Project_Short: project.details[0]?.short_name || '',
    Programme: project.details[0]?.programme_name || '',
    Programme_Short: project.details[0]?.programme_short_name || '',
    Description: project.details[0]?.project_description || '',
    Stage: project.stage || '',
    Project_Dependencies: project.details[0]?.project_dependencies || [],
    Listed_As_Project_Dependency: listedAsDependency,
    Developed: developed,
    Technical_Contact: technicalContact,
    Delivery_Manager: deliveryManager,
    Language_Main: mainLanguages,
    Language_Others: otherLanguages,
    Language_Frameworks: frameworks,
    Hosted: project.architecture.hosting.type
      ? project.architecture.hosting.type.join('; ')
      : '',
    Architectures: project.architecture.hosting.details
      ? project.architecture.hosting.details.join('; ')
      : '',
    Environments: project.architecture.environments
      ? Object.entries(project.architecture.environments)
          .filter(([key, value]) => value)
          .map(([key]) => envLabels[key] || key.toUpperCase())
          .join('; ')
      : '',
    Source_Control: sourceControl,
    Repo: project.source_control[0]?.links
      ? project.source_control[0]?.links.map(link => link.url).join('; ')
      : '',
    CICD: project.architecture.cicd.others
      ? project.architecture.cicd.others.join('; ')
      : '',
    Datastores: project.architecture.database.others
      ? project.architecture.database.others.join('; ')
      : '',
    Database_Technologies: project.architecture.database.main
      ? project.architecture.database.main.join('; ')
      : '',
    Project_Tools: project.supporting_tools.project_tracking || '',
    Documentation: Array.isArray(project.details[0]?.documentation_link)
      ? project.details[0].documentation_link.join('; ')
      : project.details[0]?.documentation_link || '',
    Infrastructure: project.architecture.infrastructure.others
      ? project.architecture.infrastructure.others.join('; ')
      : '',
    // New fields
    Code_Editors: project.supporting_tools.code_editors.others
      ? project.supporting_tools.code_editors.others.join('; ')
      : '',
    Communication: project.supporting_tools.communication.others
      ? project.supporting_tools.communication.others.join('; ')
      : '',
    Collaboration: project.supporting_tools.collaboration.others
      ? project.supporting_tools.collaboration.others.join('; ')
      : '',
    Incident_Management: project.supporting_tools.incident_management || '',
    Documentation_Tools: project.supporting_tools.documentation.others
      ? project.supporting_tools.documentation.others.join('; ')
      : '',
    UI_Tools: project.supporting_tools.user_interface.others
      ? project.supporting_tools.user_interface.others.join('; ')
      : '',
    Diagram_Tools: project.supporting_tools.diagrams.others
      ? project.supporting_tools.diagrams.others.join('; ')
      : '',
    Miscellaneous: project.supporting_tools.miscellaneous
      ? project.supporting_tools.miscellaneous
          .map(item => `${item.name}: ${item.description}`)
          .join('; ')
      : '',
  };
}

/**
 * Builds a reverse dependency map showing which projects depend on each project
 * @param {Array} projects - Array of all project objects
 * @returns {Object} Map where keys are project names and values are arrays of projects that depend on them
 */
function buildReverseDependencyMap(projects) {
  const reverseDependencyMap = {};

  projects.forEach(project => {
    const projectName =
      project.details[0]?.name || project.details[0]?.short_name || '';
    const dependencies = project.details[0]?.project_dependencies || [];

    dependencies.forEach(dependency => {
      const dependencyName = dependency.name;
      if (dependencyName) {
        if (!reverseDependencyMap[dependencyName]) {
          reverseDependencyMap[dependencyName] = [];
        }
        reverseDependencyMap[dependencyName].push({
          name: projectName,
          description: dependency.description || '',
        });
      }
    });
  });

  return reverseDependencyMap;
}

/**
 * Transforms all projects to CSV format with reverse dependency information
 * @param {Array} projects - Array of all project objects
 * @returns {Array} Array of transformed project data with dependency information
 */
function transformProjectsToCSVFormat(projects) {
  // Build reverse dependency map first
  const reverseDependencyMap = buildReverseDependencyMap(projects);

  // Transform each project with the reverse dependency information
  return projects.map(project =>
    transformProjectToCSVFormat(project, reverseDependencyMap)
  );
}

module.exports = {
  transformProjectToCSVFormat,
  transformProjectsToCSVFormat,
  buildReverseDependencyMap,
};
