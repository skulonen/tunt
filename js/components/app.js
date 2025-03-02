import { useState, useRef, useEffect } from 'preact/hooks';
import { html } from 'htm/preact';

import { Home } from './home.js';
import { Day } from './day.js';
import { Summary } from './summary.js';
import { getEntryId, getFileName } from '../util.js';

const initialDate = new Date();

export function App() {
  const [tab, setTab] = useState('home');
  const [saveTimeout, setSaveTimeout] = useState();
  const [directory, setDirectory] = useState();
  const [date, setDate] = useState(initialDate);
  const [entries, setEntries] = useState([]);

  const datePickerRef = useRef();

  useEffect(() => {
    if (!directory || !date) {
      return;
    }
    loadEntries();
  }, [directory, date]);

  async function loadEntries() {
    try {
      const fileName = getFileName(date);
      const fileHandle = await directory.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const text = await file.text();
      const trimmedText = text.trim();

      if (trimmedText == '') {
        setEntries([]);
      } else {
        const parsedEntries = JSON.parse(trimmedText);
        for (const entry of parsedEntries) {
          entry.id = getEntryId();
        }
        setEntries(parsedEntries);
      }
    } catch (e) {
      if (e instanceof DOMException && e.name == 'NotFoundError') {
        setEntries([]);
      } else throw e;
    }
  }

  async function saveEntries(entries) {
    const fileName = getFileName(date);

    if (entries.length == 0) {
      await directory.removeEntry(fileName);
      return;
    }

    const entriesWithoutId = entries.map(entry => ({ ...entry, id: undefined }));
    const stringEntries = JSON.stringify(entriesWithoutId, null, 2);

    const fileHandle = await directory.getFileHandle(fileName, { create: true });
    const stream = await fileHandle.createWritable();
    await stream.write(stringEntries);
    await stream.close();
  }

  function handleEntriesChange(newEntries) {
    setEntries(newEntries);
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    const timeout = setTimeout(() => {
      setSaveTimeout(null);
      saveEntries(newEntries);
    }, 1000);
    setSaveTimeout(timeout);
  }

  const dateString = date.toLocaleDateString('fi', {
    weekday: 'short',
    month: 'numeric',
    day: 'numeric'
  });

  return html`
    <calcite-shell>

      <calcite-navigation slot="header" style="--calcite-color-focus: transparent">
        <calcite-menu slot="content-start">
          <calcite-menu-item
            icon-start="date-time"
            text=${dateString}
            ref=${datePickerRef}
          >
            <calcite-date-picker
              slot="submenu-item"
              lang="fi"
              valueAsDate=${date}
              oncalciteDatePickerChange=${event => {
                setDate(event.target.valueAsDate);
                datePickerRef.current.open = false;
              }}
            />
          </calcite-menu-item>
          ${saveTimeout && html`<calcite-loader inline scale="s" />`}
        </calcite-menu>

        <calcite-menu slot="content-end">
          <calcite-menu-item
            active=${tab == 'home'}
            oncalciteMenuItemSelect=${() => setTab('home')}
            icon-start="home"
            text="Home"
          />
          ${directory && html`
            <calcite-menu-item
              active=${tab == 'day'}
              oncalciteMenuItemSelect=${() => setTab('day')}
              icon-start="clock"
              text="Day"
            />
            <calcite-menu-item
              active=${tab == 'summary'}
              oncalciteMenuItemSelect=${() => setTab('summary')}
              icon-start="filter"
              text="Summary"
            />
          `}
        </calcite-menu>
      </calcite-navigation>

      ${tab == 'home' && html`
        <${Home}
          directory=${directory}
          onDirectoryChange=${setDirectory}
        />
      `}
      ${tab == 'day' && html`
        <${Day}
          entries=${entries}
          onEntriesChange=${handleEntriesChange}
        />
      `}
      ${tab == 'summary' && html`<${Summary} />`}
    </calcite-shell>
  `;
}
