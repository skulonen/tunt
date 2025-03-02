export function parseTime(timeString) {
  if (!timeString) {
    return null;
  }
  let index = timeString.indexOf(':');
  if (index == -1) {
    index = timeString.indexOf('.');
    if (index == -1) {
      return null;
    }
  }
  const hours = parseInt(timeString.substring(0, index));
  const minutes = parseInt(timeString.substring(index + 1));
  if (isNaN(hours) || isNaN(minutes)) {
    return null;
  }
  return { hours, minutes };
}

export function calculateTotalMinutes(entries) {
  return entries.reduce((acc, entry) => {
    const startTime = parseTime(entry.start);
    const endTime = parseTime(entry.end);
    if (!startTime || !endTime) {
      return acc;
    }
    return acc +
      (endTime.hours - startTime.hours) * 60 +
      (endTime.minutes - startTime.minutes);
  }, 0);
}

export function formatMinutes(totalMinutes) {
  const hours = Math.trunc(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours == 0) {
    return `${minutes} min`;
  }
  if (minutes == 0) {
    return `${hours} h`;
  }
  return `${hours} h ${minutes} min`;
}

export function getFileName(date) {
  const dateString = date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0');
  return dateString + '.json';
}

let id = 0;
export function getEntryId() {
  return id++;
}
