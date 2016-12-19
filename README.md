# Tab Purger
A Firefox extention to close multiple tabs at once

This extension shows your open tabs, grouped by domain. Close all the tabs in a given domain, or expand the domain and close individual tabs.

Tabs can be closed either by middle-clicking or clicking the 'close' button to the right. Clicking on a tab title takes you to that tab.

# Building Tab Purger

Install web-ext following the instructions at https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext
cd to this directory
Run `web-ext run` to start a Firefox instance with the extension loaded temporarily

Alternatively, open about:debugging in Firefox and click 'Load Temporary Add-on'. Choose the manifest.json file in this directory to load the extension temporarily.
