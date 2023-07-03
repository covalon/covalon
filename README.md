# Covalon Module

This module contains compendiums for all Covalon related resources like deities, mentors, and expeditions.

The README is still under construction!

When you are making content edits, please work on a local copy of Foundry so you can easily access your files. Make a world specifically for working on the Covalon module - it should be the only one active on that world.

We currently have several images hosted on someone's Forge. Although we can continue doing this, we risk losing those images if Forge ever deletes them / that person deletes their Forge. That's why we work locally. All images used for the module should be uploaded into the modules/covalon/images folder.

## Editing existing compendiums


## Adding new compendiums
Unlike adding new content to existing compendiums, creating new compendiums is a little harder, especially with our structure. The following instructions assume you are creating new expeditions.

- Make sure you have the latest version of the module by updating it in Foundry. When it's updated, close Foundry.

- With Foundry closed, navigate to `User/AppData/Local/FoundryVTT/Data/Modules/covalon`

- Open the `module.json` and make the following edits:

  - Immediately after the `packs` array starts, **between lines 26 and 27**, insert the following code, replacing the name with the appropriate location. Note the capitaliation.
  ```json
    {
      "label": "Location Actors",
      "name": "location-actors",
      "path": "packs/location-actors",
      "type": "Actor",
      "system": "pf2e",
      "ownership": {
        "PLAYER": "NONE",
        "ASSISTANT": "OWNER"
      }
    },
    {
      "label": "Location Journals",
      "name": "location-journals",
      "path": "packs/location-journals",
      "type": "JournalEntry",
      "ownership": {
        "PLAYER": "NONE",
        "ASSISTANT": "OWNER"
      }
    },
    {
      "label": "Location Scenes",
      "name": "location-scenes",
      "path": "packs/location-scenes",
      "type": "Scene",
      "system": "pf2e",
      "ownership": {
        "PLAYER": "NONE",
        "ASSISTANT": "OWNER"
      }
    },
    ```
  If you end up needing items other than the standard actor / journal / scene, you can copy and paste one of the blocks and replace all mentions of Actor to i.e. Item, noting capitalization.

  - Find the `packFolders` array. Unfortunately, I cannot give you a line number, but it should be near the bottom of the json. Within it, find the section labeled like: `"name": "Expeditions"` and, after the `folders` array starts, add the following code between that line and the next:
  ```json
  { "name": "Location", "sorting": "a", "packs": ["location-actors", "location-journals", "location-scenes"] },
  ```
  If you added any extra packs above that need to go into the folder, add their `name` into the `packs` array.

- Save the `module.json` and then go and open Foundry again. If you have the Covalon module activated in the world, you should now see this new folder and its Compendiums.

- Unlock the relevant compendiums and make your changes!

## New releases
In your local `module.json`:

- Update the version number, using the format `major.minor.patch`, found on **line 8**

  - If we are fixing already existing content i.e. fixing typos or rule elements, update the **patch version**. (`1.0.0 -> 1.0.1`)

  - If we add new content i.e. a new set of expeditions or a new folder, update the **minor version** and reset patch to 0. (`1.0.5 -> 1.1.0`)

  - If Foundry or PF2E gets a major update (i.e. v10 to v11) that completely breaks the module and we have to remake things in their new versions, update the **major version** and reset minor and patch to 0. (`1.1.2 -> 2.0.0`)

    - Additionally, update the minimum compatibility the Foundry/PF2E version you're on. If Foundry broke things, change `minimum` on **line 10** to the Foundry version (`10 -> 11`). If PF2E broke things, change the `minimum` on **line 20** to the PF2E version (`4.0.0 -> 5.1.0`).

When all your files are ready,