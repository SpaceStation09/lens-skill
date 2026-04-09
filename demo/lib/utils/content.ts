export function stripMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/[>*_~#-]/g, "")
    .replace(/\n{2,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function createAbstract(markdown: string, maxLength = 180) {
  const plain = stripMarkdown(markdown);
  if (plain.length <= maxLength) {
    return plain;
  }

  return `${plain.slice(0, maxLength).trimEnd()}...`;
}

export function normalizeMarkdownForRender(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const output: string[] = [];

  const isHeading = (line: string) => /^#{1,6}\s/.test(line);
  const isRule = (line: string) => /^---+$/.test(line.trim());
  const isTableRow = (line: string) => /^\|.*\|\s*$/.test(line.trim());
  const isBlank = (line: string) => line.trim() === "";

  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const tableRow = isTableRow(line);
    const shouldSeparate = isHeading(line) || isRule(line) || (tableRow && !inTable);

    if (shouldSeparate && output.length > 0 && !isBlank(output[output.length - 1])) {
      output.push("");
    }

    if (!tableRow && inTable && trimmed !== "" && !isBlank(output[output.length - 1] ?? "")) {
      output.push("");
    }

    output.push(line);
    inTable = tableRow;
  }

  return output.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
