// Code Viewer & Syntax Highlighter Helper

export class CodeViewer {
  static highlight(code, language = 'cpp') {
    if (!code) return '<span class="text-muted">// No code content available</span>';

    // Simple, clean keyword & comment tokenization
    const lines = code.split('\n');
    return lines.map((line, idx) => {
      const lineNum = `<span style="color:#4b5563; user-select:none; display:inline-block; width:32px; text-align:right; margin-right:16px;">${idx + 1}</span>`;
      
      let formattedLine = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Comments
      if (formattedLine.trim().startsWith('//') || formattedLine.trim().startsWith('#')) {
        formattedLine = `<span style="color:#6b7280; font-style:italic;">${formattedLine}</span>`;
      } else {
        // Keywords
        formattedLine = formattedLine
          .replace(/\b(class|struct|public|private|def|return|for|while|if|else|int|bool|void|auto|const|let|const|function|import|from|include)\b/g, '<span style="color:#a855f7; font-weight:600;">$1</span>')
          .replace(/\b(true|false|null|nullptr|None|self)\b/g, '<span style="color:#fbbf24;">$1</span>')
          .replace(/(".*?"|'.*?')/g, '<span style="color:#86efac;">$1</span>')
          .replace(/\b(\d+)\b/g, '<span style="color:#38bdf8;">$1</span>');
      }

      return `<div style="display:flex; align-items:center;">${lineNum}<span>${formattedLine}</span></div>`;
    }).join('');
  }

  static copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  }
}
