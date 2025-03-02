import { useState, useRef, useEffect, useMemo } from 'preact/hooks';
import { html } from 'htm/preact';

import { calculateTotalMinutes, formatMinutes, getEntryId } from '../util.js';

export function Day({
  entries,
  onEntriesChange
}) {
  const [focusedCell, setFocusedCell] = useState([0, 0]);
  const listRef = useRef();

  const totalTime = useMemo(() => {
    return formatMinutes(calculateTotalMinutes(entries));
  }, [entries]);

  useEffect(() => {
    const [row, column] = focusedCell;
    listRef.current
      .children[row]
      ?.children[column]
      ?.setFocus();
  }, [focusedCell]);

  function getCurrentFocusedCell() {
    const activeEl = document.activeElement;
    if (!listRef.current.contains(activeEl)) {
      return [0, 0];
    }

    const rowEls = listRef.current.children;
    const row = Array.prototype.indexOf.call(rowEls, activeEl.parentElement);
    const rowEl = rowEls[row];
    const column = Array.prototype.indexOf.call(rowEl.children, activeEl);
    return [row, column];
  }

  function setFocusedRow(row) {
    const [_, column] = getCurrentFocusedCell();
    setFocusedCell([row, column]);
  }

  // Functions for modifying the entry table

  const modifyEntries = (callback) => {
    const newEntries = [...entries];
    callback(newEntries);
    onEntriesChange(newEntries);
  };

  const addEntry = (row) => modifyEntries(entries => {
    entries.splice(row, 0, { id: getEntryId() });
    setFocusedRow(row);
  });

  const duplicateEntry = (row, props) => modifyEntries(entries => {
    const newEntry = {
      ...entries[row],
      start: null,
      end: null,
      id: getEntryId()
    };
    entries.splice(row + 1, 0, newEntry);
    setFocusedRow(row + 1);
  });

  const removeEntry = (row) => modifyEntries(entries => {
    entries.splice(row, 1);
    setFocusedRow(row == entries.length ? row - 1 : row);
  });

  const updateEntry = (row, props) => modifyEntries(entries => {
    entries[row] = { ...entries[row], ...props };
  });

  const moveEntry = (sourceRow, targetRow) => modifyEntries(entries => {
    const [entry] = entries.splice(sourceRow, 1);
    entries.splice(targetRow, 0, entry);
    setFocusedRow(targetRow);
  });

  function handleKeyDown(event) {
    const { key, shiftKey, ctrlKey, altKey } = event;

    const [row, column] = getCurrentFocusedCell();

    // Override tab behavior
    if (key == 'Tab') {
      if (shiftKey) {
        setFocusedCell([row, column - 1]);
      } else {
        setFocusedCell([row, column + 1]);
      }
    }

    // Shift is used for moving between cells
    else if (shiftKey) {
      if (key == 'ArrowLeft') {
        setFocusedCell([row, column - 1]);
      } else if (key == 'ArrowRight') {
        setFocusedCell([row, column + 1]);
      } else if (key == 'ArrowUp') {
        setFocusedCell([row - 1, column]);
      } else if (key == 'ArrowDown') {
        setFocusedCell([row + 1, column]);
      } else return;
    }

    // Ctrl is used for adding rows
    else if (ctrlKey) {
      if (key == 'ArrowUp') {
        addEntry(row);
      } else if (key == 'ArrowDown') {
        addEntry(row + 1);
      } else if (key == 'd') {
        duplicateEntry(row);
      } else return;
    }

    // Alt is used for moving rows
    else if (altKey) {
      if (key == 'ArrowUp') {
        moveEntry(row, row - 1);
      } else if (key == 'ArrowDown') {
        moveEntry(row, row + 1);
      } else return;
    }

    else return;

    event.preventDefault();
  }

  return html`
    <calcite-panel>
      <div
        ref=${listRef}
        style="--calcite-color-border-input: transparent"
        onKeyDown=${event => handleKeyDown(event)}
      >
        ${entries.map((entry, row) => html`
          <div
            style="display: flex; align-items: center"
            key=${entry.id}
          >
            <calcite-input
              value=${entry.start}
              ref=${el => el?.addEventListener('calciteInputInput', event => {
                updateEntry(row, { start: event.target.value });
              })}
              icon="clock"
              style="flex: 0 0 98px"
            />
            <calcite-input
              value=${entry.end}
              ref=${el => el?.addEventListener('calciteInputInput', event => {
                updateEntry(row, { end: event.target.value });
              })}
              style="flex: 0 0 70px"
            />
            <calcite-input
              value=${entry.task}
              ref=${el => el?.addEventListener('calciteInputInput', event => {
                updateEntry(row, { task: event.target.value });
              })}
              icon="tag"
              style="flex: 0 1 160px"
            />
            <calcite-input
              value=${entry.description}
              ref=${el => el?.addEventListener('calciteInputInput', event => {
                updateEntry(row, { description: event.target.value });
              })}
              icon="pencil"
              style="flex: 1 1 160px"
            />
            <calcite-action
              icon="duplicate"
              scale="s"
              onClick=${() => duplicateEntry(row)}
            />
            <calcite-action
              icon="trash"
              scale="s"
              onClick=${() => removeEntry(row)}
            />
          </div>
        `)}
      </div>
      <div slot="footer-start" style="flex: 1 1 0">
        Total time: ${totalTime}
      </div>
      <calcite-button
        slot="footer-end"
        onClick=${() => addEntry(entries.length)}
      >
        Add time
      </calcite-button>
    </calcite-panel>
  `;
}
