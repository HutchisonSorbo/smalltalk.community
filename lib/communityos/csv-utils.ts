"use server";

/**
 * CSV utility functions for CRM import/export.
 *
 * Provides parsing and generation of CSV data for CRM contacts and deals.
 */

export interface CsvRow {
    [key: string]: string;
}

export interface CsvParseResult {
    headers: string[];
    rows: CsvRow[];
    errors: string[];
}

/**
 * Parses a CSV string into an array of row objects.
 */
export function parseCsv(csvString: string): CsvParseResult {
    const lines = csvString.trim().split(/\r?\n/);
    const errors: string[] = [];

    if (lines.length === 0) {
        return { headers: [], rows: [], errors: ["CSV file is empty"] };
    }

    const headers = parseCsvLine(lines[0]);
    const rows: CsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        if (values.length !== headers.length) {
            errors.push(`Row ${i + 1}: Expected ${headers.length} columns, got ${values.length}`);
            continue;
        }

        const row: CsvRow = {};
        headers.forEach((header, index) => {
            row[header.trim()] = values[index].trim();
        });
        rows.push(row);
    }

    return { headers, rows, errors };
}

/**
 * Parses a single CSV line, handling quoted values.
 */
function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === "," && !inQuotes) {
            result.push(current);
            current = "";
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

/**
 * Generates a CSV string from an array of objects.
 */
export function generateCsv<T extends Record<string, unknown>>(
    data: T[],
    columns: { key: keyof T; header: string }[]
): string {
    if (data.length === 0) {
        return columns.map((c) => escapeCsvValue(c.header)).join(",");
    }

    const headers = columns.map((c) => escapeCsvValue(c.header)).join(",");
    const rows = data.map((row) =>
        columns.map((col) => escapeCsvValue(String(row[col.key] ?? ""))).join(",")
    );

    return [headers, ...rows].join("\n");
}

/**
 * Escapes a value for CSV output.
 */
function escapeCsvValue(value: string): string {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

/**
 * Maps parsed CSV rows to CRM contact objects.
 */
export function mapCsvToContacts(
    rows: CsvRow[],
    mapping: { firstName?: string; lastName?: string; email?: string; phone?: string }
): { firstName: string; lastName: string; email: string; phone: string }[] {
    return rows.map((row) => ({
        firstName: row[mapping.firstName || "firstName"] || "",
        lastName: row[mapping.lastName || "lastName"] || "",
        email: row[mapping.email || "email"] || "",
        phone: row[mapping.phone || "phone"] || "",
    }));
}
