/**
 * Fetch organisation live usage data from Github API
 * 
 * @returns {Promise<Object>} - The live usage data
 */
export const fetchOrgLiveUsageData = async () => {
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
export const fetchOrgHistoricUsageData = async () => {
  try {
    let response;
    if (process.env.NODE_ENV === "development") {
      response = await fetch(`http://localhost:5001/api/org/historic`);
    } else {
      response = await fetch("/api/org/historic");
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
  const completions = {
    totalSuggestions: 0,
    totalAcceptances: 0,
    totalLinesSuggested: 0,
    totalLinesAccepted: 0,
    perDay: [],
    engagedUsersByLanguage: {},
    engagedUsersByEditor: {},
    languageBreakdown: {}
  };

  const chat = {
    totalChats: 0,
    totalInsertions: 0,
    totalCopies: 0,
    perDay: [],
    engagedUsersByEditor: {},
    editorBreakdown: {}
  };

  if (!data || !data.length) return { completions, chat };

  data.forEach((entry) => {
    const date = entry.date;

    // === COMPLETIONS ===
    const ide = entry.copilot_ide_code_completions;
    const completionsEngagedUsers = ide.total_engaged_users ?? 0;
    if (ide?.editors) {
      let dailySuggestions = 0;
      let dailyAcceptances = 0;
      let dailyLinesSuggested = 0;
      let dailyLinesAccepted = 0;

      ide.editors.forEach(editor => {
        const editorName = editor.name;

        completions.engagedUsersByEditor[editorName] =
          (completions.engagedUsersByEditor[editorName] || 0) +
          (editor.total_engaged_users ?? 0);

        editor.models?.forEach(model => {
          model.languages?.forEach(lang => {
            const langName = lang.name;
            const suggestions = lang.total_code_suggestions ?? 0;
            const acceptances = lang.total_code_acceptances ?? 0;
            const linesSuggested = lang.total_code_lines_suggested ?? 0;
            const linesAccepted = lang.total_code_lines_accepted ?? 0;
            const engagedUsers = lang.total_engaged_users ?? 0;

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

            completions.engagedUsersByLanguage[langName] =
              (completions.engagedUsersByLanguage[langName] || 0) +
              engagedUsers;
          });
        });
      });

      let acceptanceRate = dailySuggestions > 0
      ? dailyAcceptances / dailySuggestions
      : 0;

      completions.perDay.push({
        date,
        acceptances: dailyAcceptances,
        acceptanceRate: acceptanceRate * 100,
        engagedUsers: completionsEngagedUsers,
      });

      completions.totalSuggestions += dailySuggestions;
      completions.totalAcceptances += dailyAcceptances;
      completions.totalLinesSuggested += dailyLinesSuggested;
      completions.totalLinesAccepted += dailyLinesAccepted;
    }

    // === CHAT ===
    const ideChat = entry.copilot_ide_chat;
    const chatEngagedUsers = ideChat.total_engaged_users ?? 0;
    if (ideChat?.editors) {
      let dailyChats = 0;
      let dailyInsertions = 0;
      let dailyCopies = 0;

      ideChat.editors.forEach(editor => {
        const editorName = editor.name;

        chat.engagedUsersByEditor[editorName] =
          (chat.engagedUsersByEditor[editorName] || 0) +
          (editor.total_engaged_users ?? 0);

        editor.models?.forEach(model => {
          const chats = model.total_chats ?? 0;
          const insertions = model.total_chat_insertion_events ?? 0;
          const copies = model.total_chat_copy_events ?? 0;

          dailyChats += chats;
          dailyInsertions += insertions;
          dailyCopies += copies;

          if (!chat.editorBreakdown[editorName]) {
            chat.editorBreakdown[editorName] = {
              chats: 0,
              insertions: 0,
              copies: 0,
              insertionRate: 0,
              copyRate: 0
            };
          }

          chat.editorBreakdown[editorName].chats += chats;
          chat.editorBreakdown[editorName].insertions += insertions;
          chat.editorBreakdown[editorName].copies += copies;
        });
      });

      chat.perDay.push({
        date,
        engagedUsers: chatEngagedUsers,
      });

      chat.totalChats += dailyChats;
      chat.totalInsertions += dailyInsertions;
      chat.totalCopies += dailyCopies;
    }
  });

  // === FINAL CALCULATIONS ===

  completions.acceptanceRate = completions.totalSuggestions > 0
    ? completions.totalAcceptances / completions.totalSuggestions
    : 0;

  completions.lineAcceptanceRate = completions.totalLinesSuggested > 0
    ? completions.totalLinesAccepted / completions.totalLinesSuggested
    : 0;

  chat.insertionRate = chat.totalChats > 0
    ? chat.totalInsertions / chat.totalChats
    : 0;

  chat.copyRate = chat.totalChats > 0
    ? chat.totalCopies / chat.totalChats
    : 0;

  Object.entries(chat.editorBreakdown).forEach(([editorName, breakdown]) => {
    breakdown.insertionRate = breakdown.chats > 0
      ? breakdown.insertions / breakdown.chats
      : 0;
    breakdown.copyRate = breakdown.chats > 0
      ? breakdown.copies / breakdown.chats
      : 0;
  });

  return { completions, chat };
};