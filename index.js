const fs = require('fs');
const readline = require('readline');
const serviceRepositories = require('./repos.json');
require('dotenv').config();

// Define colors for console output
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';

// Create a single readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Create a single readline interface
function questionAsync(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => resolve(answer));
  });
}

// Remove leading 'v' or 'V' and 'multiarch-v' from version
function normalizeVersion(version) {
  return version.replace(/^v|multiarch-v/i, '');
}

// Normalize the URL to a GitHub URL
function normalizeUrl(url) {
  return url.replace("https://api.github.com/repos/", "https://github.com/");
}

// Check if two versions are different
function versionsAreDifferent(current, latest) {
  const currentNorm = normalizeVersion(current);
  const latestNorm  = normalizeVersion(latest);
  return currentNorm !== latestNorm;
}

async function main() {
  try {
    // Fetch current versions
    const updatesResponse = await fetch("https://stereum.net/downloads/updates.json");
    const updatesData = await updatesResponse.json();

    const notes = {included: [], excluded: []};

    const mainnet = updatesData.mainnet;
    const holesky = updatesData.holesky;
    const goerli = updatesData.goerli;
    const prater = updatesData.prater;

    // Iterate over each service, one by one
    for(const service in mainnet){
      if(!serviceRepositories[service]) continue;
      if(!process.env.GITHUB_PAT) throw new Error("GITHUB_PAT not set in .env file");

      // Fetch the latest release
      const latestReleaseResponse = await fetch(
        serviceRepositories[service] + "/releases/latest",
        {
          headers: {
            "Authorization": process.env.GITHUB_PAT
          }
        }
      );
      const release = await latestReleaseResponse.json();

      // Show version info
      const currentVersion = mainnet[service][mainnet[service].length - 1];
      const newVersion = release.tag_name;
      const difference = versionsAreDifferent(currentVersion, newVersion);
      const color = (difference) ? GREEN : RESET;
      console.log(
        color + service + " " + currentVersion + " -> " + newVersion + RESET
      );

      // Ask if user wants to include new version
      if (difference) {
        const answer = await questionAsync(
          `Include ${service} ${GREEN}${newVersion}${RESET} (from ${YELLOW}${currentVersion}${RESET})? ${normalizeUrl(serviceRepositories[service])}/releases y/n `
        );
        if (answer.toLowerCase() === "y") {
          if(Array.isArray(mainnet[service])) mainnet[service].push((currentVersion.replace(/[0-9]*\.[0-9]*.*/g, "")) + normalizeVersion(newVersion));
          if(Array.isArray(holesky[service])) holesky[service].push((currentVersion.replace(/[0-9]*\.[0-9]*.*/g, "")) + normalizeVersion(newVersion));
          if(Array.isArray(goerli[service])) goerli[service].push((currentVersion.replace(/[0-9]*\.[0-9]*.*/g, "")) + normalizeVersion(newVersion));
          if(Array.isArray(prater[service])) prater[service].push((currentVersion.replace(/[0-9]*\.[0-9]*.*/g, "")) + normalizeVersion(newVersion));
          notes.included.push(service + " -> " + newVersion);
        }else{
          notes.excluded.push(service + " " + newVersion);
        }
      }
    }

    //write notes to file
    formattedNotes = "updates.json updated:\n```\n" + notes.included.join("\n") + "\n```\n\n" + notes.excluded.map((note) => "currently **not** included " + note + ":\n```\nComment\n```").join("\n\n");
    fs.writeFileSync("notes.txt", formattedNotes);

    // Write the updated data to a file
    fs.writeFileSync("updates.json", JSON.stringify(updatesData, null, 2));
    console.log("updates.json has been updated!");

  } catch (err) {
    console.error("Error fetching or processing data:", err);
  } finally {
    // Close readline after all questions are done
    rl.close();
  }
}

main();
