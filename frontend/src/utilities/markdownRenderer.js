/**
 * Simple markdown renderer that supports basic formatting:
 * - *italic* text
 * - **bold** text
 * - [link text](url) links
 * 
 * @param {string} text - The markdown text to render
 * @returns {string} - HTML string with basic markdown formatting applied
 */
export const renderSimpleMarkdown = (text) => {
  if (!text || typeof text !== 'string') {
    return text || '';
  }

  let html = text;

  html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Handle headers - ## h2 first, then # h1 to avoid conflicts
  html = html.replace(/^## (.+)$/gm, '<h2 class="markdown-h2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="markdown-h1">$1</h1>');

  html = html.replace(/\n/g, '<p>');

  return html;
};

/**
 * React component wrapper for rendering markdown with dangerouslySetInnerHTML
 * 
 * @param {Object} props - Component props
 * @param {string} props.text - The markdown text to render
 * @param {string} props.className - Optional CSS class name
 * @returns {JSX.Element} - React element with rendered markdown
 */
export const MarkdownText = ({ text, className = '' }) => {
  const html = renderSimpleMarkdown(text);
  
  return (
    <span 
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}; 