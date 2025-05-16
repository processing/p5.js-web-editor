const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function updateHelmetImports(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');

    // Check if the file imports Helmet from react-helmet
    if (
      content.includes("import { Helmet } from 'react-helmet'") ||
      content.includes("import Helmet from 'react-helmet'")
    ) {
      // Replace the import statement
      const updatedContent = content
        .replace(
          "import { Helmet } from 'react-helmet'",
          "import { Helmet } from 'react-helmet-async'"
        )
        .replace(
          "import Helmet from 'react-helmet'",
          "import { Helmet } from 'react-helmet-async'"
        );

      // Write the updated content back to the file
      await writeFile(filePath, updatedContent, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

function getFilesInDirectory(dir) {
  const results = [];

  const processDir = (currentDir) => {
    const files = fs.readdirSync(currentDir);

    files.forEach((file) => {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules and .git directories
        if (file !== 'node_modules' && file !== '.git') {
          processDir(fullPath);
        }
      } else if (
        stat.isFile() &&
        (file.endsWith('.js') || file.endsWith('.jsx'))
      ) {
        results.push(fullPath);
      }
    });
  };

  processDir(dir);
  return results;
}

// Get all files and then process them
const processAllFiles = async () => {
  const files = getFilesInDirectory('./client');

  // Process files sequentially to avoid too many open files
  return files.reduce(
    (promise, file) => promise.then(() => updateHelmetImports(file)),
    Promise.resolve()
  );
};

// Start processing files
processAllFiles()
  .then(() => console.log('Helmet imports updated successfully!'))
  .catch((err) => console.error('Error updating Helmet imports:', err));
