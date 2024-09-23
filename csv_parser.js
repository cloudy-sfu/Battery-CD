function parse_csv(csvString) {
  const lines = csvString.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');
  // Parse the header line to get column names
  const headerLine = lines.shift();
  const columnNames = parse_csv_line(headerLine);
  // Parse each data line into an array of floats
  const dataMatrix = lines.map(line => {
    const fields = parse_csv_line(line);
    return fields.map(field => parseFloat(field));
  });
  return {"columnNames": columnNames, "dataMatrix": dataMatrix};
}

function parse_csv_line(line) {
  const fields = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped double quote inside a quoted field
        field += '"';
        i++;
      } else {
        // Toggle the inQuotes flag
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      // Comma outside quotes signifies end of field
      fields.push(field);
      field = '';
    } else {
      // Regular character inside a field
      field += c;
    }
  }
  // Add the last field
  fields.push(field);
  return fields;
}
