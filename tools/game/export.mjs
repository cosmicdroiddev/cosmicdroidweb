import { loadProject, exportProject, gd_internal_logs } from "gdcore-tools";
import { resolve } from "node:path";
const project = await loadProject(resolve("proj/leapkill.json"));
exportProject(project, resolve("out"));
console.log(gd_internal_logs.split("\n").filter(l=>/err|warn|fail/i.test(l)).slice(0,20).join("\n"));
console.log("EXPORTED");
process.exit(0);
