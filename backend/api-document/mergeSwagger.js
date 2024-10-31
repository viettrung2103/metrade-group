import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the current directory (__dirname equivalent in ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load base.json
const basePath = path.join(__dirname, "base.json");
const baseContent = JSON.parse(fs.readFileSync(basePath, "utf-8"));

// Define paths to merge
const pathsToMerge = [
  "auth.json",
  "order.json",
  "admin-order.json",
  "carts.json",
  "users.json",
  "token.json",
  "carts.json",
  "products.json",
  "sellers.json",
  "categories.json",
  "admin.json"
];

// Function to merge paths into base
pathsToMerge.forEach((file) => {
  const filePath = path.join(__dirname, file);
  const pathContent = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // Merge paths
  baseContent.paths = { ...baseContent.paths, ...pathContent };
});

// Write the merged result to swagger.json
fs.writeFileSync(
  path.join(__dirname, "swagger.json"),
  JSON.stringify(baseContent, null, 2),
  "utf-8"
);
console.log("swagger.json has been generated successfully.");
