# <img src="resources/images/icon.svg" height="32px" alt="Icon"/> Copyous NG - Clipboard Manager
[![GitHub License](https://img.shields.io/github/license/Geovane2dd/copyous-ng)](./LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/Geovane2dd/copyous-ng)](https://github.com/Geovane2dd/copyous-ng/releases/latest)

![Screenshot](resources/images/screenshot.png)

## Features
- Supports text, code, images, files, links, characters and colors.
- Can be opened at mouse pointer or text cursor
- Pin favorite items
- Group items with 9 colored tags
- Customizable clipboard actions
- Highly customizable

## Installation
For the extension to work optimally you need to install the following dependencies:
- Libgda 5.0 or 6.0 with SQLite support
- GSound

<details>
<summary>Install Libgda and GSound</summary>

| Distro        | Command                                                                            |
|---------------|------------------------------------------------------------------------------------|
| Fedora        | `sudo dnf install libgda libgda-sqlite`                                            |
| Arch Linux    | `sudo pacman -S libgda6`                                                           |
| Ubuntu/Debian | `sudo apt install gir1.2-gda-5.0 gir1.2-gsound-1.0`                                |
| openSUSE      | `sudo zypper install libgda-6_0-sqlite typelib-1_0-Gda-6_0 typelib-1_0-GSound-1_0` |
</details>

### From Latest GitHub Release
1. Download the latest release from [Releases](https://github.com/Geovane2dd/copyous-ng/releases).
2. Install extension:
   ```shell
   gnome-extensions install -f ~/Downloads/copyous-ng@geovanedd.com.zip
   ```
3. Restart the session by logging out.
4. Enable the extension in [Extension Manager](https://flathub.org/en/apps/com.mattjakeman.ExtensionManager) or by running the following command:
   ```shell
   gnome-extensions enable copyous-ng@geovanedd.com
   ```

### From Source
1. Install the following prerequisites:
	- Make
    - Node.js
    - [pnpm](https://pnpm.io/installation)
    - [jq](https://jqlang.org/)
2. Clone the repository:
   ```shell
   git clone --recurse-submodules https://github.com/Geovane2dd/copyous-ng
   cd copyous-ng
   ```
3. Build and install the extension:
   ```shell
   pnpm install
   ```
4. Restart the session by logging out.
5. Enable the extension in [Extension Manager](https://flathub.org/en/apps/com.mattjakeman.ExtensionManager) or by running the following command:
   ```shell
   gnome-extensions enable copyous-ng@geovanedd.com
   ```

## Configuration
You can open the extension settings either through the panel indicator, [Extension Manager](https://flathub.org/en/apps/com.mattjakeman.ExtensionManager) or by running the following command:
```shell
gnome-extensions prefs copyous-ng@geovanedd.com
```

## Shortcuts
The most common shortcuts are listed below. Some can be customized in the extension settings. You can also find a complete list of all available shortcuts there.

| Description           | Shortcut                                                                                                      |
|-----------------------|---------------------------------------------------------------------------------------------------------------|
| Open Clipboard Dialog | <kbd>Super</kbd> <kbd>Shift</kbd> <kbd>V</kbd>                                                                |
| Toggle Incognito Mode | <kbd>Super</kbd> <kbd>Shift</kbd> <kbd>Ctrl</kbd> <kbd>V</kbd>                                                |
| Copy Item             | <kbd>Enter</kbd> / <kbd>Space</kbd>                                                                           |
| Run Default Action    | <kbd>Ctrl</kbd> <kbd>Enter</kbd> / <kbd>Space</kbd>                                                           |
| Pin Item              | <kbd>Ctrl</kbd> <kbd>S</kbd>                                                                                  |
| Delete Item           | <kbd>Delete</kbd> (Hold <kbd>Shift</kbd> to force delete)                                                     |
| Navigation            | <kbd>Tab</kbd> / <kbd>↑</kbd> / <kbd>↓</kbd> / <kbd>←</kbd> / <kbd>→</kbd> / <kbd>Home</kbd> / <kbd>End</kbd> |
| Jump to Item          | <kbd>Ctrl</kbd> <kbd>0</kbd>...<kbd>9</kbd>                                                                   |
| Toggle Pinned Search  | <kbd>Alt</kbd>                                                                                                |
| Cycle Item Type       | <kbd>Ctrl</kbd> <kbd>Tab</kbd> / <kbd>Shift</kbd> <kbd>Ctrl</kbd> <kbd>Tab</kbd>                              |
| Cycle Item Tag        | <kbd>Ctrl</kbd> <kbd>\`</kbd> / <kbd>Shift</kbd> <kbd>Ctrl</kbd> <kbd>\`</kbd>                                |

## DBus
**Name:** `org.gnome.Shell.Extensions.Copyous`
**Path:** `/org/gnome/Shell/Extensions/Copyous`

| Method         | Arguments                                                                                                    | Description                       |
|----------------|--------------------------------------------------------------------------------------------------------------|-----------------------------------|
| `Toggle`       |                                                                                                              | Show or hide the clipboard dialog |
| `Show`         |                                                                                                              | Show the clipboard dialog         |
| `Hide`         |                                                                                                              | Hide the clipboard dialog         |
| `ClearHistory` | `all`:<br/>&emsp; if `true`, clears all history; <br/>&nbsp;&emsp;if `false`, clears unpinned/untagged items | Clear clipboard history           |

### Examples
```shell
gdbus call --session \
    --dest org.gnome.Shell.Extensions.Copyous \
    --object-path /org/gnome/Shell/Extensions/Copyous \
    --method org.gnome.Shell.Extensions.Copyous.Toggle
```
```shell
gdbus call --session \
    --dest org.gnome.Shell.Extensions.Copyous \
    --object-path /org/gnome/Shell/Extensions/Copyous \
    --method org.gnome.Shell.Extensions.Copyous.ClearHistory false
```

## Contributing
See [CONTRIBUTING.md](./CONTRIBUTING.md) for more information.

## Acknowledgments
Copyous NG is a fork of [Copyous](https://github.com/boerdereinar/copyous) by boerdereinar, which is itself a full rewrite of [Pano](https://github.com/oae/gnome-shell-pano).

## License
This project is licensed under the **GNU General Public License 3 or Later**.
