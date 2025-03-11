let entryId = 0;
export function nextEntryId() {
  return entryId++;
}

let errorId = 0;
export function nextErrorId() {
  return errorId++;
}
