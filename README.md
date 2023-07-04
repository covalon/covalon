# Covalon Module
This module contains compendiums for all Covalon related resources like deities, mentors, and expeditions.

The README is still under construction!

## Getting Started
Foundry sucks and made everything way more complicated so you're gonna need something called Git. Luckily, Github has made a program to help make this easier!! Go download https://desktop.github.com/ and login with the Github account you're gonna use for Covalon.

Clone a repository from the internet, go to the URL tab, and paste in `https://github.com/isabroch/covalon`. Set the local path to your Foundry modules folder (looks something like `C:/Users/yourusernamehere/AppData/Local/FoundryVTT/Data/Modules`) - it _SHOULD_ automatically append a /covalon at the end of the local path when you've properly selected it, but if it doesn't, add it. Then hit the clone button.

When it's done, you should now have a folder called **covalon** in your modules folder, and have a window saying `no local changes`. You will want to open up Github Desktop whenever you're going to edit the module.

When you are making content edits, please work on a local copy of Foundry so you can easily access your files. Make a world specifically for working on the Covalon module - it should be the only one active on that world.

If you are ever uploading images, please make sure to upload them into `modules/covalon/images`

## DO THIS BEFORE YOU MAKE ANY CHANGES


- With Foundry closed, open up Github Desktop. Hit the button called `fetch origin`.

- When it's done, proceed with the steps listed in the section relevant to you. This will usually be either **Editing existing compendiums** OR **Adding new compendiums**, and then followed up by **Finishing up and making a new release**.

- PS, you can use the `show in explorer` button to be linked straight to the module folder!

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
      "banner": "systems/pf2e/assets/compendium-banner/red.webp",
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
      "banner": "systems/pf2e/assets/compendium-banner/red.webp",
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
      "banner": "systems/pf2e/assets/compendium-banner/red.webp",
      "path": "packs/location-scenes",
      "type": "Scene",
      "system": "pf2e",
      "ownership": {
        "PLAYER": "NONE",
        "ASSISTANT": "OWNER"
      }
    },
    ```
  If you end up needing items other than the standard actor / journal / scene, you can copy and paste one of the blocks and replace all mentions of Actor to i.e. Item, noting capitalization. See (https://gitlab.com/encounterlibrary/my-content-module/-/blob/main/module.json) for how to format the `type` field.

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

Time to upload everything! Open up **Github Desktop**. You should see it say something like `160+ changed files`. It's a lot, I know.

- In the `Summary (required)` field, type in the version number you wrote into module.json, prepending it with a v, like so: `v2.0`

- Due to the new Foundry format, it's much harder at a glance to see what content has changed. I like to use the `description` field to write my changelogs, and then copy and paste that when I do my release too. This is optional.

- Hit the `Commit to main` button!

- When that's done, hit the `Push origin` button.

- And when *that's* done, it's time to hit the `View on Github` button. You should see, once it's loaded, next to the README.md and packs folder, the text you put in `summary` i.e. `v2.0`

-