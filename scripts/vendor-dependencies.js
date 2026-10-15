"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const checkOnly = process.argv.includes("--check");
const manifest = require(path.join(root, "vendor-dependencies.json"));
let failed = false;

function hash(contents) {
  // Git may check text assets out with CRLF on Windows. Compare normalized
  // bytes so a line-ending-only difference does not make the vendor check fail.
  const normalized = Buffer.from(
    contents.toString("utf8").replace(/\r\n/g, "\n"),
    "utf8"
  );
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

function filesBelow(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const relative = path.join(prefix, entry.name);
      return entry.isDirectory()
        ? filesBelow(path.join(directory, entry.name), relative)
        : [relative];
    })
    .sort();
}

function directoriesMatch(source, destination) {
  if (!fs.existsSync(destination) || !fs.statSync(destination).isDirectory()) {
    return false;
  }
  const sourceFiles = filesBelow(source);
  const destinationFiles = filesBelow(destination);
  return sourceFiles.length === destinationFiles.length &&
    sourceFiles.every((relative, index) =>
      relative === destinationFiles[index] &&
      hash(fs.readFileSync(path.join(source, relative))) ===
        hash(fs.readFileSync(path.join(destination, relative)))
    );
}

for (const asset of manifest.assets) {
  const packageRoot = path.join(root, "node_modules", asset.package);
  const packageJsonPath = path.join(packageRoot, "package.json");
  const sourcePath = path.join(packageRoot, asset.source);
  const destinationPath = path.join(root, asset.destination);

  if (!fs.existsSync(packageJsonPath) || !fs.existsSync(sourcePath)) {
    console.error(`Missing ${asset.package}; run npm ci before vendoring.`);
    failed = true;
    continue;
  }

  const installed = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  if (installed.version !== asset.version) {
    console.error(
      `${asset.package}: expected ${asset.version}, installed ${installed.version}`
    );
    failed = true;
    continue;
  }

  const sourceIsDirectory = fs.statSync(sourcePath).isDirectory();
  const matches = sourceIsDirectory
    ? directoriesMatch(sourcePath, destinationPath)
    : fs.existsSync(destinationPath) &&
      hash(fs.readFileSync(sourcePath)) === hash(fs.readFileSync(destinationPath));

  if (checkOnly) {
    if (!matches) {
      console.error(`${asset.destination} is not synchronized with ${asset.package}.`);
      failed = true;
    } else {
      console.log(`${asset.destination} is up to date.`);
    }
    continue;
  }

  if (matches) {
    console.log(`${asset.destination} is already up to date.`);
    continue;
  }

  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  if (sourceIsDirectory) {
    fs.rmSync(destinationPath, { recursive: true, force: true });
    fs.cpSync(sourcePath, destinationPath, { recursive: true });
  } else {
    fs.copyFileSync(sourcePath, destinationPath);
  }
  console.log(`Updated ${asset.destination} from ${asset.package}@${installed.version}.`);
}

if (failed) {
  process.exitCode = 1;
}
