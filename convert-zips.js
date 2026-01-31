const fs = require('fs');

const input = fs.readFileSync('zip_codes_full.csv', 'utf8');
const lines = input.trim().split('\n');

// Skip header, process data
const output = ['zip,lat,lng'];
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',');
  const zip = parts[0];
  const lat = parts[5];
  const lng = parts[6];
  if (zip && lat && lng) {
    output.push(`${zip},${lat},${lng}`);
  }
}

fs.writeFileSync('zip_ready.csv', output.join('\n'));
console.log(`Converted ${output.length - 1} ZIP codes`);
