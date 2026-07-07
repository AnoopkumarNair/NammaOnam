const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

const sponsorsStart = content.indexOf('          {/* Sponsors & Food Stalls */}');
const sponsorsEnd = content.indexOf('          {/* Gallery */}');

if (sponsorsStart !== -1 && sponsorsEnd !== -1) {
  const sponsorsBlock = content.slice(sponsorsStart, sponsorsEnd);
  content = content.slice(0, sponsorsStart) + content.slice(sponsorsEnd);
  
  const walkathonStart = content.indexOf('          {/* Walkathon Leaderboard */}');
  if (walkathonStart !== -1) {
    content = content.slice(0, walkathonStart) + sponsorsBlock + content.slice(walkathonStart);
    
    content = content.replace('title="Sponsors & Food Stalls" index={5}', 'title="Sponsors & Food Stalls" index={2}');
    content = content.replace('title="Walkathon Leaderboard" index={2}', 'title="Walkathon Leaderboard" index={3}');
    content = content.replace('title="Badminton Tournament" index={3}', 'title="Badminton Tournament" index={4}');
    content = content.replace('title="Cultural Programs" index={4}', 'title="Cultural Programs" index={5}');
    
    fs.writeFileSync('src/app/page.tsx', content, 'utf8');
    console.log('Successfully reordered page.tsx');
  } else {
    console.log('Walkathon not found');
  }
} else {
  console.log('Sponsors not found');
}
