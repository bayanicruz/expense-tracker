const fs = require('fs');
const path = require('path');

// Read the titles from JSON config
const titlesConfigFile = path.join(__dirname, 'src', 'config', 'titles.json');
const titlesConfig = JSON.parse(fs.readFileSync(titlesConfigFile, 'utf8'));

// Pick a random sentence
const randomSentence = titlesConfig.titles[Math.floor(Math.random() * titlesConfig.titles.length)];

// Read index.html
const indexFile = path.join(__dirname, 'public', 'index.html');
const indexContent = fs.readFileSync(indexFile, 'utf8');

// Replace the title
const updatedContent = indexContent.replace(
  /<title>.*<\/title>/,
  `<title>${randomSentence}</title>`
);

// Write back to index.html
fs.writeFileSync(indexFile, updatedContent);

console.log(`Title updated to: "${randomSentence}"`);