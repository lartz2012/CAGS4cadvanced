const fs = require('fs');
const https = require('https');

https.get('https://gemindex.world/', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('site.html', data);
    console.log(`Saved site.html (${data.length} bytes)`);

    // Extract all script tags
    const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    let index = 0;
    while ((match = scriptRegex.exec(data)) !== null) {
      const fullTag = match[0];
      const content = match[1];
      const srcMatch = fullTag.match(/src=["']([^"']+)["']/i);
      console.log(`\n--- Script #${++index} ---`);
      if (srcMatch) {
        console.log(`External src: ${srcMatch[1]}`);
      } else {
        console.log(`Inline script length: ${content.length} characters`);
        console.log(`Preview: ${content.slice(0, 150).replace(/\n/g, ' ')}...`);
      }
    }
  });
}).on('error', (err) => {
  console.error('Error fetching:', err);
});
