/**
 * Fetch organisation live usage data from Github API
 * 
 * @returns {Promise<Object>} - The live usage data
 */
export const fetchLiveUsageData = async () => {
  try {
    let response;
    if (process.env.NODE_ENV === "development") {
      response = await fetch(`http://localhost:5001/api/org/live`);
    } else {
      response = await fetch("/api/org/live");
    }
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching usage data:", error);
    return null;
  }
}

/**
 * Fetch organisation historic usage data from AWS S3
 * 
 * @returns {Promise<Object>} - The historic usage data
 */
export const fetchHistoricUsageData = async () => {
  //TODO
}

/**
 * Filter usage data based on start and end date
 * 
 * @param {Object} data - The full, raw usage data
 * @param {string} startDate - ISO date string for start of range to filter
 * @param {string} endDate - ISO date string for end of range to filter
 * @returns {Object} - The filtered usage data
 */
export const filterUsageData = (data, startDate, endDate) => {
  if (!data || !data.length) return [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  return data.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= start && itemDate <= end;
  });
}

/**
 * Process usage data in a format suitable for dashboard display
 * 
 * @param {Object} data  - Filtered usage data
 * @returns {Object} - The processed usage data
 */
export const processUsageData = (data) => {
  //TODO: Check returned values against existing dashboard
    const completions = {
      totalSuggestions: 0,
      totalAcceptances: 0,
      totalLinesSuggested: 0,
      totalLinesAccepted: 0,
      perDay: [],//fix - only need acceptances, acceptance rate, engaged users
      engagedUsersByLangEditor: {},  //language and editor should be separate
      languageBreakdown: {}//acceptance rate and line acceptance rate missing but optional - can calculate in frontend
    };
  
    const chat = {
      totalChats: 0,
      totalInsertions: 0,
      totalCopies: 0,
      perDay: [], //fix - only need engaged users
      engagedUsersByLangEditor: {},//language and editor should be separate
      editorBreakdown: {} // insertion and copy rates missing but optional - can calculate in frontend
    };
  
    data.forEach((entry) => {
      const date = entry.date;
  
      // === COMPLETIONS ===
      const ide = entry.copilot_ide_code_completions;
      if (ide?.editors) {
        let dailySuggestions = 0;
        let dailyAcceptances = 0;
        let dailyLinesSuggested = 0;
        let dailyLinesAccepted = 0;
  
        ide.editors.forEach(editor => {
          editor.models?.forEach(model => {
            model.languages?.forEach(lang => {
              const langName = lang.name;
              const suggestions = lang.total_code_suggestions ?? 0;
              const acceptances = lang.total_code_acceptances ?? 0;
              const linesSuggested = lang.total_code_lines_suggested ?? 0;
              const linesAccepted = lang.total_code_lines_accepted ?? 0;
  
              dailySuggestions += suggestions;
              dailyAcceptances += acceptances;
              dailyLinesSuggested += linesSuggested;
              dailyLinesAccepted += linesAccepted;
  
              // per language breakdown
              if (!completions.languageBreakdown[langName]) {
                completions.languageBreakdown[langName] = {
                  suggestions: 0,
                  acceptances: 0,
                  linesSuggested: 0,
                  linesAccepted: 0
                };
              }
  
              completions.languageBreakdown[langName].suggestions += suggestions;
              completions.languageBreakdown[langName].acceptances += acceptances;
              completions.languageBreakdown[langName].linesSuggested += linesSuggested;
              completions.languageBreakdown[langName].linesAccepted += linesAccepted;
  
              // engaged users by lang + editor
              const key = `${langName}::${editor.name}`;
              completions.engagedUsersByLangEditor[key] =
                (completions.engagedUsersByLangEditor[key] || 0) +
                (lang.total_engaged_users ?? 0);
            });
          });
        });
  
        completions.perDay.push({
          date,
          suggestions: dailySuggestions,
          acceptances: dailyAcceptances,
          linesSuggested: dailyLinesSuggested,
          linesAccepted: dailyLinesAccepted
        });
  
        completions.totalSuggestions += dailySuggestions;
        completions.totalAcceptances += dailyAcceptances;
        completions.totalLinesSuggested += dailyLinesSuggested;
        completions.totalLinesAccepted += dailyLinesAccepted;
      }
  
      // === CHAT ===
      const ideChat = entry.copilot_ide_chat;
      if (ideChat?.editors) {
        let dailyChats = 0;
        let dailyInsertions = 0;
        let dailyCopies = 0;
  
        ideChat.editors.forEach(editor => {
          editor.models?.forEach(model => {
            const chats = model.total_chats ?? 0;
            const insertions = model.total_chat_insertion_events ?? 0;
            const copies = model.total_chat_copy_events ?? 0;
  
            dailyChats += chats;
            dailyInsertions += insertions;
            dailyCopies += copies;
  
            if (!chat.editorBreakdown[editor.name]) {
              chat.editorBreakdown[editor.name] = {
                chats: 0,
                insertions: 0,
                copies: 0
              };
            }
  
            chat.editorBreakdown[editor.name].chats += chats;
            chat.editorBreakdown[editor.name].insertions += insertions;
            chat.editorBreakdown[editor.name].copies += copies;
  
            // engaged users by editor
            const key = editor.name;
            chat.engagedUsersByLangEditor[key] =
              (chat.engagedUsersByLangEditor[key] || 0) +
              (model.total_engaged_users ?? 0);
          });
        });
  
        chat.perDay.push({
          date,
          chats: dailyChats,
          insertions: dailyInsertions,
          copies: dailyCopies
        });
  
        chat.totalChats += dailyChats;
        chat.totalInsertions += dailyInsertions;
        chat.totalCopies += dailyCopies;
      }
    });
  
    // === FINAL CALCULATIONS ===
    completions.acceptanceRate =
      completions.totalSuggestions > 0
        ? completions.totalAcceptances / completions.totalSuggestions
        : 0;
  
    completions.lineAcceptanceRate =
      completions.totalLinesSuggested > 0
        ? completions.totalLinesAccepted / completions.totalLinesSuggested
        : 0;
  
    chat.insertionRate =
      chat.totalChats > 0 ? chat.totalInsertions / chat.totalChats : 0;
  
    chat.copyRate =
      chat.totalChats > 0 ? chat.totalCopies / chat.totalChats : 0;
  
    return { completions, chat }; 
}