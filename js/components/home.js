import { useState } from 'preact/hooks';
import { html } from 'htm/preact';

export function Home({
  directory,
  onDirectoryChange
}) {
  async function pickDirectory() {
    try {
      const directory = await showDirectoryPicker();
      onDirectoryChange(directory);
    } catch {}
  }

  function renderContent() {
    if (!directory) {
      return html`
        <div style="display: flex; justify-content: center; padding: 1rem">
          <calcite-button
            scale="l"
            icon-start="folder"
            onClick=${pickDirectory}
          >
            Select storage folder
          </calcite-button>
        </div>
      `;
    }

    return html`
      <div style="padding: 1rem">
        <calcite-label>
          Storage folder
          <calcite-input
            value=${directory.name}
            read-only
          >
            <calcite-button
              slot="action"
              icon-start="folder"
              onClick=${pickDirectory}
            />
          </calcite-input>
        </calcite-label>
      </div>
    `;
  }

  return html`
    <calcite-panel>
      ${renderContent()}
      <div slot="footer">
        Created by skulonen | <calcite-link
          href="https://github.com/skulonen/tunt"
          target="_blank"
        >
          GitHub
        </calcite-link>
      </div>
    </calcite-panel>
  `;
}
