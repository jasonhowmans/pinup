           ______    ___    ___      ___    ___   ___    ______
         /      /  /   /  /    \   /   /  /   / /   /  /      /
        /  /_  /  /   /  /      \ /   /  /   / /   /  /  /_  /
       /   _ _/  /   /  /   /\   /   /  /   / /   /  /   _ _/
      /  /      /   /  /   /  \     /  /    _    /  /  /
     /__/      /___/  /___/    \___/   \________/  /__/
    ------------------------------------------------------------
                    Take snaps with your browser
    ------------------------------------------------------------

Pinup is a Google Chrome plugin made for designer or collector types who like to keep snapshots of webpages for future refrence.

The project was started on a cold January day, when out of frustration, creator Jason Howmans wanted a better way to keep high quality images of full webpages without having to jump in and out of different applications. A Chrome plugin seemed to make sense because, being a part of the browser, it can gather information about the webpage like _title_, _description_ and so on, without needing to get in the user's way.

**The plugin is still incomplete, with the task list currently looking like this:**

Done:
- ✓ Native screen capture process (this is not ideal right now as it uses 'captureVisibleTab', which only captures the visible frame. This means the page has to be scrolled to splice all of the images together, and this is noticeable to the user).
- ✓ Storage library with the ability to add multiple services (currently only Dropbox is supported).
- ✓ Authenticate client & upload captures using Dropbox.
- ✓ Use the chrome.storage API to store meta information about the captures.

To to:
- ✗ Design and build library area, where user can browse and manage 'pinups'.
- ✗ Design a better icon.
- ✗ Unit Testing.
- ✗ Code refactoring.
- ✗ Publish to the Chrome store (expected by 31st Jan 2014).