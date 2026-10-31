import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import postcss from "postcss";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const stylesheet = path.join(root, "src/styles.css");
const css = await readFile(stylesheet, "utf8");

function formatDeclarations(nodes, depth) {
  const indentation = "  ".repeat(depth);
  const lines = [];
  let group = [];

  function flush() {
    if (group.length) {
      lines.push(`${indentation}  ${group.join(" ")}`);
      group = [];
    }
  }

  for (const node of nodes) {
    if (node.type !== "decl") {
      flush();
      lines.push(`${indentation}  /* ${node.text.trim()} */`);
      continue;
    }
    const important = node.important ? " !important" : "";
    group.push(`${node.prop}: ${node.value}${important};`);
    if (group.length === 3) flush();
  }
  flush();
  return lines;
}

function render(nodes, depth = 0) {
  const indentation = "  ".repeat(depth);

  return nodes
    .map((node) => {
      if (node.type === "comment") {
        return `${indentation}/* ${node.text.trim()} */`;
      }

      if (node.type === "decl") {
        const important = node.important ? " !important" : "";
        return `${indentation}${node.prop}: ${node.value}${important};`;
      }

      if (node.type === "rule" || node.type === "atrule") {
        const selector =
          node.type === "rule"
            ? node.selector
            : `@${node.name}${node.params ? ` ${node.params}` : ""}`;
        if (!node.nodes) return `${indentation}${selector};`;

        const hasNestedRules = node.nodes.some(
          (child) =>
            child.type === "rule" ||
            (child.type === "atrule" && child.nodes),
        );
        const contents = hasNestedRules
          ? render(node.nodes, depth + 1).split("\n")
          : formatDeclarations(node.nodes, depth);

        return [
          `${indentation}${selector} {`,
          ...contents,
          `${indentation}}`,
        ].join("\n");
      }

      return "";
    })
    .filter(Boolean)
    .join("\n");
}

function getStructure(node) {
  const structure = { type: node.type };
  for (const key of ["name", "params", "selector", "prop", "value", "important"]) {
    if (node[key] !== undefined) structure[key] = node[key];
  }
  if (node.type === "comment") structure.text = node.text.trim();
  if (node.nodes) structure.nodes = node.nodes.map(getStructure);
  return structure;
}

function findDifference(before, after, location = "root") {
  if (typeof before !== typeof after || before === null || after === null) {
    return Object.is(before, after)
      ? null
      : { location, before, after };
  }
  if (typeof before !== "object") {
    return Object.is(before, after) ? null : { location, before, after };
  }

  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const result = findDifference(before[key], after[key], `${location}.${key}`);
    if (result) return result;
  }
  return null;
}

const originalStructure = getStructure(postcss.parse(css));
const formatted = `${render(postcss.parse(css).nodes)}\n`;
const difference = findDifference(
  originalStructure,
  getStructure(postcss.parse(formatted)),
);
if (difference) {
  throw new Error(
    `El formato condensado cambiaría los estilos (${JSON.stringify(difference)}).`,
  );
}
await writeFile(stylesheet, formatted);
console.log(`Estilos: ${css.split("\n").length - 1} → ${formatted.split("\n").length - 1} líneas.`);
