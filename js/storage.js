import { nextEntryId } from './counters.js';

export class Storage {
  directory;

  constructor(directory) {
    this.directory = directory;
  }

  async loadEntries(date) {
    try {
      const fileName = getFileName(date);
      const fileHandle = await this.directory.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const text = await file.text();
      const trimmedText = text.trim();

      if (trimmedText == '') {
        return [];
      } else {
        const parsedEntries = JSON.parse(trimmedText);
        for (const entry of parsedEntries) {
          entry.id = nextEntryId();
        }
        return parsedEntries;
      }
    } catch (e) {
      if (e instanceof DOMException && e.name == 'NotFoundError') {
        return [];
      } else throw e;
    }
  }

  async saveEntries(date, entries) {
    const fileName = getFileName(date);

    if (entries.length == 0) {
      await this.directory.removeEntry(fileName);
      return;
    }

    const entriesWithoutId = entries.map(entry => ({ ...entry, id: undefined }));
    const stringEntries = JSON.stringify(entriesWithoutId, null, 2);

    const fileHandle = await this.directory.getFileHandle(fileName, { create: true });
    const stream = await fileHandle.createWritable();
    await stream.write(stringEntries);
    await stream.close();
  }
}

function getFileName(date) {
  const dateString = date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0');
  return dateString + '.json';
}
