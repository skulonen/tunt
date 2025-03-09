import { useState, useRef } from 'preact/hooks';
import { html } from 'htm/preact';

import { Home } from './home.js';
import { Day } from './day.js';
import { Summary } from './summary.js';

const initialDate = new Date();

export function App() {
  const [tab, setTab] = useState('home');
  const [storage, setStorage] = useState();
  const [date, setDate] = useState(initialDate);

  const dateString = date.toLocaleDateString('fi', {
    weekday: 'short',
    month: 'numeric',
    day: 'numeric'
  });

  function changeDateRelative(offset) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + offset);
    setDate(newDate);
  }

  return html`
    <calcite-shell>

      <calcite-popover
        reference-element="date-picker-action"
        placement="bottom-start"
        auto-close
      >
        <calcite-date-picker
          lang="fi"
          valueAsDate=${date}
          oncalciteDatePickerChange=${event => {
            setDate(event.target.valueAsDate);
            event.target.parentElement.open = false;
          }}
        />
      </calcite-popover>

      <calcite-navigation slot="header" style="--calcite-color-focus: transparent">
        <calcite-action-bar
          slot="content-start"
          layout="horizontal"
          scale="l"
          expand-disabled
        >
          <calcite-action
            icon="chevron-left"
            scale="l"
            onClick=${() => changeDateRelative(-1)}
          />
          <calcite-action
            id="date-picker-action"
            text=${dateString}
            text-enabled
            scale="l"
          />
          <calcite-action
            icon="chevron-right"
            scale="l"
            onClick=${() => changeDateRelative(1)}
          />
        </calcite-action-bar>

        <calcite-menu slot="content-end">
          <calcite-menu-item
            active=${tab == 'home'}
            oncalciteMenuItemSelect=${() => setTab('home')}
            icon-start="home"
            text="Home"
          />
          ${storage && html`
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
          storage=${storage}
          onStorageChange=${setStorage}
        />
      `}
      ${tab == 'day' && html`
        <${Day}
          storage=${storage}
          date=${date}
        />
      `}
      ${tab == 'summary' && html`
        <${Summary}
          storage=${storage}
          date=${date}
        />
      `}
    </calcite-shell>
  `;
}
