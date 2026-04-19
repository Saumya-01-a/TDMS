const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function refactorBrandColors() {
  const srcDir = path.join(__dirname, 'DrivingSchoolManagementSystem', 'src');
  
  walkDir(srcDir, (filePath) => {
    if (filePath.endsWith('.css') || filePath.endsWith('.jsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      // Replace Cyan hex colors with That Red hex
      content = content.replace(/#64ffda/gi, '#E11B22');
      // Replace references to --accent-cyan with --accent-red
      content = content.replace(/--accent-cyan/g, '--accent-red');

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Updated:", filePath);
      }
    }
  });
}

refactorBrandColors();
