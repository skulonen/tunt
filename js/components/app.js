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

  const datePickerRef = useRef();

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
        </calcite-menu>

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
