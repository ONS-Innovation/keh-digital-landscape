/**
 * Transforms a project object from the raw JSON format to the CSV format.
 * @param {Object} project - The raw project data object
 * @returns {Object} The transformed project data in CSV format
 */
function transformProjectToCSVFormat(project) {


  const technicalContact = project.user.find(u => u.roles.includes("Technical Contact") && (u.email?.includes("@ons.gov.uk") || u.email?.includes("@ext.ons.gov.uk"))) ? `${project.user.find(u => u.roles.includes("Technical Contact")).email} (${project.user.find(u => u.roles.includes("Technical Contact")).grade})` : "";
  const deliveryManager = project.user.find(u => u.roles.includes("Delivery Manager") && (u.email?.includes("@ons.gov.uk") || u.email?.includes("@ext.ons.gov.uk"))) ? `${project.user.find(u => u.roles.includes("Delivery Manager")).email} (${project.user.find(u => u.roles.includes("Delivery Manager")).grade})` : "";

  
  // Get main languages and others as comma-separated strings
  const mainLanguages = project.architecture.languages.main.join("; ");
  const otherLanguages = project.architecture.languages.others.join("; ");
  const frameworks = project.architecture.frameworks.others.join("; ");
  
  // Get source control details
  const sourceControl = project.source_control[0]?.type || "";
  const developed = project.developed[1] != '' ? `${project.developed[0]} with ${project.developed.slice(1).join(", ")}` : project.developed[0];
  // Transform to match desired CSV structure
  return {
    Project: project.details[0]?.name || "",
    Project_Short: project.details[0]?.short_name || "",
    Programme: project.details[0]?.programme_name || "",
    Programme_Short: project.details[0]?.programme_short_name || "",
    Description: project.details[0]?.project_description || "",
    Stage: project.stage || "",
    Developed: developed,
    Technical_Contact: technicalContact,
    Delivery_Manager: deliveryManager,
    Language_Main: mainLanguages,
    Language_Others: otherLanguages,
    Language_Frameworks: frameworks,
    Hosted: project.architecture.hosting.type ? project.architecture.hosting.type.join("; ") : "",
    Architectures: project.architecture.hosting.details ? project.architecture.hosting.details.join("; ") : "",
    Source_Control: sourceControl,
    Repo: project.source_control[0]?.links ? project.source_control[0]?.links.map(link => link.url).join("; ") : "",
    CICD: project.architecture.cicd.others ? project.architecture.cicd.others.join("; ") : "",
    Datastores: project.architecture.database.others ? project.architecture.database.others.join("; ") : "",
    Database_Technologies: project.architecture.database.main ? project.architecture.database.main.join("; ") : "",
    Project_Tools: project.supporting_tools.project_tracking || "",
    Documentation: project.details[0]?.documentation_link?.join("; ") || "",
    Infrastructure: project.architecture.infrastructure.others ? project.architecture.infrastructure.others.join("; ") : "",
    // New fields
    Code_Editors: project.supporting_tools.code_editors.others ? project.supporting_tools.code_editors.others.join("; ") : "",
    Communication: project.supporting_tools.communication.others ? project.supporting_tools.communication.others.join("; ") : "",
    Collaboration: project.supporting_tools.collaboration.others ? project.supporting_tools.collaboration.others.join("; ") : "",
    Incident_Management: project.supporting_tools.incident_management || "",
    Documentation_Tools: project.supporting_tools.documentation.others ? project.supporting_tools.documentation.others.join("; ") : "",
    UI_Tools: project.supporting_tools.user_interface.others ? project.supporting_tools.user_interface.others.join("; ") : "",
    Diagram_Tools: project.supporting_tools.diagrams.others ? project.supporting_tools.diagrams.others.join("; ") : ""
  };
}

module.exports = {
  transformProjectToCSVFormat
}; 