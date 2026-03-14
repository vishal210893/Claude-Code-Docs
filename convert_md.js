const fs = require('fs');
const marked = require('marked');

// Configure marked to not escape HTML just in case
marked.setOptions({
  gfm: true,
  breaks: true
});

const files = fs.readdirSync('.').filter(f => f.startsWith('chapter-') && f.endsWith('.html'));
let totalReplaced = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Regex to match code blocks specifically labeled as 'markdown'
  const regex = /<div class="code-block">\s*<div class="cb-header(?:[^>]*)">\s*<span class="cb-lang">markdown<\/span>\s*<\/div>\s*<pre><code>([\s\S]*?)<\/code><\/pre>\s*<\/div>/g;
  
  content = content.replace(regex, (match, markdownText) => {
     // unescape HTML entities if any were encoded in the pre block
     const unescaped = markdownText
       .replace(/&lt;/g, '<')
       .replace(/&gt;/g, '>')
       .replace(/&amp;/g, '&')
       .replace(/&quot;/g, '"');
       
     let html = marked.parse(unescaped);
     changed = true;
     totalReplaced++;
     return `<div class="rendered-markdown">\n${html}\n</div>`;
  });

  if (changed) {
     fs.writeFileSync(file, content);
     console.log(`Updated ${file}`);
  }
});

console.log(`Replaced ${totalReplaced} markdown blocks across all chapters.`);
