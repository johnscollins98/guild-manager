import { config } from "./src/config";

for (const [key, value] of Object.entries(config)) {
  if (value === undefined) {
    throw new Error(`Must provide ${key}`)
  } else if (typeof value === 'number' && Number.isNaN(value)) {
    throw new Error(`Invalid numeric value for ${key}`)
  }
}
console.log('Environmental variables presence check successfully passed')
