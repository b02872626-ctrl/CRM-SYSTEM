
export function parseCsvRow(line: string, delimiter: string = ",") {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      const nextChar = line[index + 1];

      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (char === delimiter && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

export function parseCsv(text: string) {
  // Remove BOM if present
  const cleanText = text.replace(/^\uFEFF/, "");
  
  const lines = cleanText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line.trim());

  if (lines.length < 2) {
    return [];
  }

  // Detect delimiter: Check first line for tabs vs commas
  const firstLine = lines[0];
  const commaCount = (firstLine.match(/,/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const delimiter = tabCount > commaCount ? "\t" : ",";

  const headers = parseCsvRow(lines[0], delimiter).map((h) => 
    h.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
  );

  return lines.slice(1).map((line) => {
    const values = parseCsvRow(line, delimiter);
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      if (header) {
        row[header] = values[index] ?? "";
      }
    });

    return row;
  });
}

export function normalizeOptionalString(value: string) {
  return value ? value : null;
}

export function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function getStringList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
}
