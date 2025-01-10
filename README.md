# Stereum Update Checker

A simple tool to check for updates available to include in the Stereum updates.json file.

## Features
- Automatically checks for not included updates in Stereums updates.json.
- Provides clear notifications about available updates.
- Easy to configure and run.

## Requirements
- **Node.js**: Make sure you have Node.js installed (version >= 18.x).
- **Dependencies**: Install the required Node.js packages listed in `package.json`.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/NeoPlays/Stereum-Update-Checker.git
   cd Stereum-Update-Checker
   ```

2. Install dependencies:
   ```bash
   npm i
   ```

3. Create a `.env` file and add your Github Personal Access Token:
   ```bash
   GITHUB_PAT=<your-github-pat>
   ```

## Usage

1. Run the update checker script:
   ```bash
   node index.js
   or
   npm start
    ```

2. The tool will automatically check for updates and ask you if you want to include them in the updates.json file.

## License
This project is licensed under the [MIT License](LICENSE).

## Issues
If you encounter any issues or have questions, feel free to open an [issue](https://github.com/NeoPlays/Stereum-Update-Checker/issues).

---

Enjoy using Stereum Update Checker! 🚀

