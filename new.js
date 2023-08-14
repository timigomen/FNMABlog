const fs = require('fs');
const path = require('path');

if (process.argv[2] === 'np') {
    const fileName = process.argv[3];
    
    if (!fileName) {
        console.error('Usage: node index.js np <filename>');
        process.exit(1);
    }

    const filePath = path.join(__dirname, 'posts', `${fileName}.md`);
    const currentTime = new Date().toLocaleString();
    const fileContent = `[time:${currentTime};sum:${currentTime};]\n\n# ${fileName}`;

    fs.writeFile(filePath, fileContent, (err) => {
        if (err) {
            console.error('Error creating file:', err);
        } else {
            console.log(`Markdown file '${fileName}.md' created successfully.`);
        }
    });
}
