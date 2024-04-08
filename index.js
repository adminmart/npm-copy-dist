#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const ncp = promisify(require("ncp").ncp);
const args = process.argv.slice(2); // Extract command line arguments

const createDestinationFolder = async (destinationFolder) => {
  try {
    await fs.promises.mkdir(destinationFolder, { recursive: true });
  } catch (err) {
    console.error(
      `Error creating destination folder ${destinationFolder}:`,
      err
    );
    process.exit(1);
  }
};

const copyDistFiles = async () => {
  const pkg = require(path.resolve(process.cwd(), "package.json"));
  const dependencies = Object.keys(pkg.dependencies || {});

  // Extract destination folder path from command line arguments
  const destinationFolder =
    args.length > 0 ? path.resolve(args[0]) : path.resolve("libs");

  await createDestinationFolder(destinationFolder);

  for (const dependency of dependencies) {
    const sourceModule = path.resolve("node_modules", dependency);
    const sourceDist = path.resolve(sourceModule, "dist");
    const destinationModule = path.resolve(destinationFolder, dependency);
    const destinationDist = path.resolve(destinationModule, "dist");

    try {
      if (fs.existsSync(sourceDist)) {
        await ncp(sourceDist, destinationDist);
        console.log(
          `Copied 'dist' files of ${dependency} to ${destinationFolder} directory.`
        );
      } else {
        await ncp(sourceModule, destinationModule);
        console.log(
          `Copied entire ${dependency} module to ${destinationFolder} directory.`
        );
      }
    } catch (err) {
      console.error(`Error copying files of ${dependency}:`, err);
    }
  }
};

copyDistFiles();
