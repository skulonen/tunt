import { useState, useEffect, useMemo } from 'preact/hooks';
import { html } from 'htm/preact';

import { calculateTotalMinutes, formatMinutes } from '../time.js';

export function Summary({
  storage,
  date
}) {
  const [dateGroups, setDateGroups] = useState([]);
  const [taskGroups, setTaskGroups] = useState([]);
  const [groupMode, setGroupMode] = useState('date');

  const weekDates = useMemo(() => {
    // In JS, sunday is day number 0, so we need to adjust for that
    const dayOffset = date.getDay() == 0 ? 6 : date.getDay() - 1;
    const mondayNumber = date.getDate() - dayOffset;

    return Array.from({ length: 7 }, (_, i) => {
      const newDate = new Date(date);
      newDate.setDate(mondayNumber + i);
      return newDate;
    });
  }, [date]);

  useEffect(() => {
    loadWeekEntries();
  }, [weekDates]);

  async function loadWeekEntries() {
    setDateGroups([]);
    setTaskGroups([]);

    // Fetch entries for all dates concurrently
    const promises = weekDates.map(date => storage.loadEntries(date));
    const entryLists = await Promise.all(promises);

    // Attach date to each entry and flatten lists
    const entriesWithDates = weekDates.flatMap((date, i) => {
      const dateString = date.toLocaleDateString('fi', {
        weekday: 'short',
        month: 'numeric',
        day: 'numeric'
      });
      return entryLists[i].map(entry => ({
        date: dateString,
        ...entry
      }));
    });

    function mapByDate(entries, mapFn) {
      return Object.entries(Object.groupBy(entries, entry => entry.date)).map(mapFn);
    }

    function mapByTask(entries, mapFn) {
      return Object.entries(Object.groupBy(entries, entry => entry.task)).map(mapFn);
    }

    function aggregateEntries(entries) {
      const totalTime = formatMinutes(calculateTotalMinutes(entries));

      const descriptions = entries.map(entry => entry.description);
      const uniqueDescriptions = new Set(descriptions);
      const totalDescription = [...uniqueDescriptions].join(', ');

      return { totalTime, totalDescription };
    }

    const dateGroups = mapByDate(entriesWithDates, ([date, dateEntries]) => ({
      date,
      taskGroups: mapByTask(dateEntries, ([task, taskEntries]) => ({
        task,
        ...aggregateEntries(taskEntries)
      }))
    }));

    const taskGroups = mapByTask(entriesWithDates, ([task, taskEntries]) => ({
      task,
      dateGroups: mapByDate(taskEntries, ([date, dateEntries]) => ({
        date,
        ...aggregateEntries(dateEntries)
      }))
    }));

    setDateGroups(dateGroups);
    setTaskGroups(taskGroups);
  }

  function renderContent() {
    if (groupMode == 'date') {
      return dateGroups.map(dateGroup => html`
        <calcite-block
          collapsible
          open
          heading=${dateGroup.date}
          icon-start="calendar"
        >
          ${dateGroup.taskGroups.map(taskGroup => html`
            <div style="display: flex; align-items: center">
              <calcite-input
                value=${taskGroup.task}
                read-only
                icon="tag"
                style="flex: 0 1 160px"
              />
              <calcite-input
                value=${taskGroup.totalTime}
                read-only
                icon="clock"
                style="flex: 0 0 120px"
              />
              <calcite-input
                value=${taskGroup.totalDescription}
                read-only
                icon="pencil"
                style="flex: 1 1 160px"
              />
            </div>
          `)}
        </calcite-block>
      `);
    } else if (groupMode == 'task') {
      return taskGroups.map(taskGroup => html`
        <calcite-block
          collapsible
          open
          heading=${taskGroup.task}
          icon-start="tag"
        >
          ${taskGroup.dateGroups.map(dateGroup => html`
            <div style="display: flex; align-items: center">
              <calcite-input
                value=${dateGroup.date}
                read-only
                icon="calendar"
                style="flex: 0 1 160px"
              />
              <calcite-input
                value=${dateGroup.totalTime}
                read-only
                icon="clock"
                style="flex: 0 0 120px"
              />
              <calcite-input
                value=${dateGroup.totalDescription}
                read-only
                icon="pencil"
                style="flex: 1 1 160px"
              />
            </div>
          `)}
        </calcite-block>
      `);
    }
  }

  return html`
    <calcite-panel>
      <calcite-block-group>
        ${renderContent()}
      </calcite-block-group>
      <div slot="footer-start" style="display: flex; align-items: center; gap: 0.75rem">
        <span>Group by</span>
        <calcite-chip-group selection-mode="single-persist">
          <calcite-chip
            kind="brand"
            selected=${groupMode == 'date'}
            oncalciteChipSelect=${() => setGroupMode('date')}
          >
            Day
          </calcite-chip>
          <calcite-chip
            kind="brand"
            selected=${groupMode == 'task'}
            oncalciteChipSelect=${() => setGroupMode('task')}
          >
            Task
          </calcite-chip>
        </calcite-chip-group>
      </div>
    </calcite-panel>
  `;
}
