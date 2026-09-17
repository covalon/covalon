# Covalon — Setup Guide

This is the one-time setup guide for anyone helping maintain the Covalon Foundry module — deities, mentors, and expeditions compendiums. Follow it top to bottom once, and you'll have everything you need for every future session. Once you're done, everyday work (pulling changes, editing, committing) lives in the [main README](README.md#2-your-everyday-editing-workflow) — this file is just for getting a computer ready the first time.

If you get stuck anywhere in this guide, hit @nelizzy (Ateia) up in #pogchamp-tech-support.

> **Already have the old `covalon/covalon` set up on your computer?.** The old repo is getting fully replaced by this one which means your existing local copy can't just "pull" its way onto the new version. So we gotta fully replace it or else it'll cause issues.
> 1. If you've made any specific changes to the module that _aren't_ in the live module yet, make sure to import them to keep a local copy of them.
> 2. Fully quit Foundry VTT if it's open.
> 3. In Foundry, delete the old `covalon` folder from your `Data/modules` folder entirely (see [section 3a](#3a-find-your-foundry-data-folder) if you're not sure where that is).
> 4. In **GitHub Desktop**, find the old Covalon repository in the repo list (top-left dropdown), right-click it, and choose **Remove** — this only removes it from GitHub Desktop's list, it doesn't delete anything else (you already did that in step 2).
> 5. Now you can start fresh!
>
> If this is your first time setting anything up at all, ignore this box.

## Contents

1. [Prerequisites](#1-prerequisites)
2. [Setup](#2-setup)
3. [Getting the project files](#3-getting-the-project-files)
4. [First-time project setup](#4-first-time-project-setup)

---

## 1. Prerequisites

- **Local Foundry instance**, installed on your computer.
- **A GitHub account**, and an invitation to the `covalon/covalon` repository (ask nelizzy if you don't have access yet).
- Windows 10/11 or macOS. Steps below are given for both; skip whichever doesn't apply to you.

---

## 2. Setup

You only need to do everything in this section once per computer. If you already installed GitHub Desktop for the old module, you can skip step 2a and jump to 2b.

### 2a. Install GitHub Desktop (includes Git)

> Quick primer if this is all new to you!
> 
> **Git** is the system that keeps track of every change ever made to this project — who changed what, when, and lets everyone's changes get combined together without overwriting each other. **GitHub** is just the website that hosts the project's Git history online (`github.com/covalon/covalon`), so everyone's copy can sync through it.
> 
> **GitHub Desktop** is a handy dandy application with buttons, not a command line — it gives you a visual way to download everyone else's latest changes ("pull"), see exactly what you've changed, and upload your own changes ("push"), without ever having to type a Git command. It also comes bundled with Git and Git LFS (used below for images), so installing it covers all three.

If you already installed GitHub Desktop for the old module, you can skip straight to confirming you're signed in below.

**Windows and Mac:**

1. Go to [desktop.github.com](https://desktop.github.com) and click the download button for your operating system.
2. Run the installer and follow the prompts (Windows: run the `.exe`; Mac: drag the app into Applications).
3. Open GitHub Desktop and sign in with your GitHub account when prompted (**File/GitHub Desktop menu → Options/Preferences → Accounts → Sign in**). If you don't have a GitHub account yet, it'll offer to let you create one — free, just an email and a username.

If you already have GitHub Desktop installed from before, just open it and confirm you're signed in.

### 2b. Install Node.js

Node.js runs the small helper scripts this project uses to convert content back and forth (the "repack"/"unpack" steps — more on those in the [main README](README.md#1-how-it-works)), and to optimize images.

**Windows only — turn on Developer Mode.** Some of the tools `npm install` pulls in need to create what's called a "symlink," and Windows blocks that for regular (non-admin) users unless Developer Mode is switched on — it shows up as an error mentioning `EPERM` or "symlink" if you hit it. Worth just turning it on now rather than waiting to hit the error:

1. Open **Settings → Privacy & Security → For developers** (or search "Developer Mode" in the Start menu).
2. Toggle **Developer Mode** on.

**Windows and Mac:**

1. Go to [nodejs.org](https://nodejs.org).
2. Click the big download button for the **LTS** version (LTS = "Long Term Support"; it's the stable, recommended one — don't pick "Current").
3. Run the installer, accepting all the defaults (keep every checkbox as-is, including "Add to PATH").
4. Restart your computer after installing (this makes sure Node.js is available everywhere it needs to be).

**To check it worked:** open a terminal — Command Prompt or PowerShell on Windows, Terminal on Mac — and type:

```
node -v
```

You should see a version number like `v22.x.x` or higher. If you instead get an error like "command not found" or "not recognized," restart your computer and try again; if it still fails, the installer likely needs to be re-run.

### 2c. Install Visual Studio Code (VS Code)

VS Code is a free code/text editor. You'll mostly use it for opening a terminal that's already pointed at the right folder, and occasionally peeking at a file.

**Windows and Mac:**

1. Go to [code.visualstudio.com](https://code.visualstudio.com) and click **Download**.
2. Run the installer.
   - **Windows:** on the "Select Additional Tasks" screen, tick **"Add to PATH"** if it isn't already checked. The other defaults are fine.
   - **Mac:** drag the app into Applications, then open it once from there.

You now have everything installed: GitHub Desktop (+ Git + Git LFS), Node.js, and VS Code. Yippee! 🥳

### 2d. Get comfortable opening a terminal in VS Code

You'll be opening a terminal a lot in this guide, so it's worth getting used to it now. A "terminal" is just a text-based way to type commands instead of clicking buttons. Super handy when you get used to it!

Once you have a folder open in VS Code (**File → Open Folder…**):

- **Windows:** press `` Ctrl + ` ``
- **Mac:** press `` Cmd + ` ``

Or **Terminal → New Terminal** from the menu bar at the top.

Either way, a panel opens at the bottom of the window with a blinking cursor — that's the terminal, and it's already sitting in whatever folder you have open in VS Code, so you can just start typing. Every command in this guide (`npm install`, `npm run repack`, etc.) gets typed there, followed by Enter.

---

## 3. Getting the project files

We're setting things up so Foundry reads the project folder *directly*. That means where you clone the repo matters.

### 3a. Find your Foundry "Data" folder

This is the folder Foundry stores all its user content in — worlds, systems, and modules.

- **Windows:** `%localappdata%\FoundryVTT\Data` — you can jump straight there by pressing `Win + R`, pasting `%localappdata%\FoundryVTT\Data`, and hitting Enter; or right click the icon on the taskbar and click User Data.
- **Mac:** `~/Library/Application Support/FoundryVTT/Data` — in Finder, press `Cmd + Shift + G` and paste that path.

Inside that `Data` folder you should see folders named `worlds`, `systems`, and `modules`. If you're not sure this is the right folder, you can also check it from inside Foundry: **Configuration and Setup → Application Settings/Options**, where the "Data Path" is shown.

### 3b. Clone the repository straight into `Data/modules`

"Cloning" just means downloading a full copy of the repository, connected to GitHub so you can pull updates and push your changes.
> It will say something like *"This repository uses Git LFS, initialize it now?"* when you load the repo. Click **Yes/Initialize**.

1. Open **GitHub Desktop**.
2. Go to **File → Clone Repository**.
3. Click the **GitHub.com** tab, find `covalon/covalon` in the list (or paste the URL `https://github.com/covalon/covalon.git` under the **URL** tab), and select it.
4. For **Local Path**, click **Choose...** and browse directly into your Foundry `Data/modules` folder from step 3a (e.g. `...\FoundryVTT\Data\modules` on Windows, or `.../FoundryVTT/Data/modules` on Mac). GitHub Desktop will create one folder called `covalon` inside there — make sure it lands directly in `modules`, not nested a level too deep (i.e. you want `modules/covalon`, not `modules/covalon/covalon`).
5. Click **Clone**.

This will take a little while the first time, since it also has to download every image through Git LFS.

**How to check it worked:** Inside `Data/modules` you should now have a `covalon` folder, and inside *that*, files like `module.json`, `package.json`, and folders like `images`, `src`, `scripts`. Open a couple of files under `images/` — they should open as actual pictures, not tiny text files. 

(If they *are* tiny text files full of gibberish, see [Troubleshooting in the main README](README.md#7-troubleshooting) — that means Git LFS didn't download the real images.)

---

## 4. First-time project setup

Now that the files are on your computer, you need to install the project's own small toolset and build the compendiums so Foundry can read them. You'll do this once now, and the "repack" part again every time you pull new changes (see [the everyday workflow in the main README](README.md#2-your-everyday-editing-workflow)).

1. Open **VS Code**.
2. **File → Open Folder…**, and select the `covalon` folder you cloned in step 3b (the one containing `module.json`).
3. Open a terminal inside VS Code: **Terminal → New Terminal** (or `` Ctrl+` `` / `` Cmd+` ``). This opens a command line that's already sitting in the right folder — you'll use this terminal for every command in this guide from now on.
4. Type the following and press Enter:

   ```
   npm install
   ```

   This downloads the small set of tools the project's scripts depend on. It only needs to be re-run later if `package.json` or `package-lock.json` ever change (a pull will tell you if files changed, but running it again never hurts).

5. Then run:

   ```
   npm run repack
   ```

   This builds the `packs/` folder Foundry actually reads, from the YAML source files in `src/packs/`. You should see a line printed for each compendium ("Packing …").

   This is also the point where a little automation kicks in for good: because you just ran `npm install`, this project's git hook (via a tool called Husky) is now active in your local clone, and from here on it'll run this exact command for you automatically every time you pull — see [the everyday workflow in the main README](README.md#2-your-everyday-editing-workflow). You only need to run it by hand here, once, for this very first setup.

6. Launch **Foundry VTT** itself (the desktop app), go to **Add-on Modules**, and confirm **Covalon** appears in the list and is enabled for your world. Load your world and check that the Covalon compendiums show up with content in them.

7. **Lock the module — THIS IS VERY IMPORTANT, DO NOT SKIP.** While you're on the **Add-on Modules** screen, right-click **Covalon** and choose **Lock Module**. Foundry occasionally shows an "Update" button next to modules when a newer version exists on GitHub (see [Making a new release](README.md#5-making-a-new-release) in the main README) — but for you, this folder *is* your Git clone, not something Foundry should manage. If you ever click that Update button, Foundry will download and overwrite the whole folder with a release build, obliterating the development setup and any of your uncommitted work in it. Locking the module removes the Update button entirely and stops that from happening by accident. You only need to do this once — it stays locked from here on.

If all that worked, you're fully set up! You don't need to repeat anything in this guide again — from here on, everything you do day to day lives in the **[main README](README.md#2-your-everyday-editing-workflow)**.
