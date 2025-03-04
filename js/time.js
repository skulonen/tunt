export function parseMinutes(timeString) {
  if (!timeString) {
    return NaN;
  }
  let index = timeString.indexOf(':');
  if (index == -1) {
    index = timeString.indexOf('.');
    if (index == -1) {
      return NaN;
    }
  }
  const hours = parseInt(timeString.substring(0, index));
  const minutes = parseInt(timeString.substring(index + 1));
  if (isNaN(hours) || isNaN(minutes)) {
    return NaN;
  }
  return hours * 60 + minutes;
}

export function calculateTotalMinutes(entries) {
  return entries.reduce((acc, entry) => {
    const startMinutes = parseMinutes(entry.start);
    const endMinutes = parseMinutes(entry.end);
    if (isNaN(startMinutes) || isNaN(endMinutes)) {
      return acc;
    }
    return acc + (endMinutes - startMinutes);
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

export function validateTimes(entry, previousEntry) {
  const startMinutes = parseMinutes(entry.start);
  const endMinutes = parseMinutes(entry.end);
  const previousEndMinutes = parseMinutes(previousEntry?.end);

  const isStartValid = !isNaN(startMinutes)
    && (isNaN(previousEndMinutes) || startMinutes >= previousEndMinutes);
  const isEndValid = !isNaN(endMinutes)
    && (isNaN(startMinutes) || endMinutes > startMinutes);
  return { isStartValid, isEndValid };
}
