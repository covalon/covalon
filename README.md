# Covalon Module
This module contains compendiums for all Covalon related resources like deities, mentors, and expeditions.

The README is still under construction!

## Getting Started
Foundry sucks and made everything way more complicated so you're gonna need something called Git! Download it from https://git-scm.com/download/win and install it.

Download the module locally - we're not using Foundry for this, but instead, go to your Foundry user module data (should look like `Users/yourusernamehere/AppData/Local/FoundryVTT/Data/Modules`). Shift right click in a blank space on the explorer and hit the **Open Powershell window here**.

When it opens a window, copy and paste this command in:
`git clone https://github.com/isabroch/covalon.git`

When it's done, you should now have a folder called **covalon** in your modules folder!

When you are making content edits, please work on a local copy of Foundry so you can easily access your files. Make a world specifically for working on the Covalon module - it should be the only one active on that world.

We currently have several images hosted on someone's Forge. Although we can continue doing this, we risk losing those images if Forge ever deletes them / that person deletes their Forge. That's why we work locally. All images used for the module should be uploaded into the modules/covalon/images folder.

## DO THIS BEFORE YOU MAKE ANY CHANGES
If the Covalon module has updated since you've last had it in your local Foundry, do the following:

- With Foundry closed, navigate to your covalon module folder (should look like `Users/yourusernamehere/AppData/Local/FoundryVTT/Data/Modules/covalon`)

- Open a Powershell window there, as per the instructions in **Getting Started** and run the command
`git pull`

- When it's done, proceed with the steps listed in the section relevant to you (this will usually be either **Editing existing compendiums** OR **Adding new compendiums**, and then followed up by **Finishing up and making a new release**)

## Editing existing compendiums
This is as simple as going into Foundry after you've pulled down the latest changes, and making your edits as needed.

## Adding new compendiums
Unlike adding new content to existing compendiums, creating new compendiums is a little harder, especially with our structure. These steps are required to properly maintain folder structure - V11 is currently very finnicky >:(

The following instructions assume you are creating new expeditions:

- Open the `module.json` and make the following edits:

  - Immediately after the `packs` array starts, **between lines 26 and 27**, insert the following code, replacing all `location` with the appropriate name. Note the capitaliation.
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

  - Find the `packFolders` array. Unfortunately, I cannot give you a line number, but it should be near the bottom of the json. Within it, find the section labeled like: `"name": "Expeditions"` and, after the `folders` array starts, add the following code between that line and the next, replacing all `location` with the appropriate name. Note the capitaliation:
  ```json
  { "name": "Location", "sorting": "a", "packs": ["location-actors", "location-journals", "location-scenes"] },
  ```
  If you added any extra packs in the step above that need to go into the folder, add their `name` into the `packs` array.

- Save the `module.json` and then go and open Foundry again. If you have the Covalon module activated in the world, you should now see this new folder and its Compendiums.

- Unlock the relevant compendiums and add your content!

## Finishing up and making a new release
**MAKE SURE FOUNDRY IS CLOSED BEFORE YOU PROCEED.**

In your local `module.json`:

- Update the version number, using the format `major.minor`, found on **line 8**

  - For almost everything - new content, changing existing content, etc., update the **minor version**. (`1.0 -> 1.1`)

  - If Foundry or PF2E gets a major update (i.e. v10 to v11) that completely breaks the module and we have to remake things in their new versions, update the **major version** and reset minor to 0. (`1.1 -> 2.0`)

    - Additionally, update the minimum compatibility the Foundry/PF2E version you're on. If Foundry broke things, change `minimum` on **line 10** to the Foundry version (`10 -> 11`). If PF2E broke things, change the `minimum` on **line 20** to the PF2E version (`4.0.0 -> 5.1.0`). If both of them broke things, change both.

It's time to open the Powershell in the covalon module folder again!

- Run the following command, replacing VERSIONHERE with whatever version you mentioned in module.json:
`git add . && git commit -m "VERSIONHERE" && git push`