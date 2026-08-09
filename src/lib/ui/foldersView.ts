import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import { gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Dialog from 'resource:///org/gnome/shell/ui/dialog.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as ModalDialog from 'resource:///org/gnome/shell/ui/modalDialog.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import type CopyousExtension from '../../extension.js';
import { boxLayoutProps } from '../common/boxLayout.js';
import { registerClass } from '../common/gjs.js';
import { Icon } from '../common/icons.js';

/**
 * Simple "type a name, confirm or cancel" prompt, used for both creating and renaming a folder.
 */
@registerClass({
	Signals: {
		confirmed: {
			param_types: [GObject.TYPE_STRING],
		},
	},
})
export class FolderNameDialog extends ModalDialog.ModalDialog {
	private readonly _entry: St.Entry;

	constructor(title: string, initialName: string = '') {
		super({ styleClass: 'folder-name-dialog', destroyOnClose: true });

		const content = new Dialog.MessageDialogContent({ title });
		this.contentLayout.add_child(content);

		this._entry = new St.Entry({
			style_class: 'folder-name-dialog-entry',
			can_focus: true,
			text: initialName,
		});
		content.add_child(this._entry);
		this.setInitialKeyFocus(this._entry);
		this._entry.clutter_text.set_selection(0, initialName.length);

		this._entry.clutter_text.connect('activate', () => this._confirm());

		this.addButton({
			label: _('Cancel'),
			action: () => this.close(),
			default: false,
			key: Clutter.KEY_Escape,
		});

		this.addButton({
			label: _('Save'),
			action: () => this._confirm(),
			default: true,
		});
	}

	private _confirm() {
		const name = this._entry.text.trim();
		if (!name) return;

		this.emit('confirmed', name);
		this.close();
	}
}

@registerClass()
class FolderRow extends St.Button {
	constructor(
		private ext: CopyousExtension,
		public readonly folderName: string,
	) {
		super({ style_class: 'folder-row', can_focus: true, x_expand: true });

		const box = new St.BoxLayout({ style_class: 'folder-row-box', x_expand: true });
		this.child = box;

		box.add_child(new St.Icon({ style_class: 'folder-row-icon', icon_name: Icon.Folder }));

		box.add_child(
			new St.Label({
				style_class: 'folder-row-label',
				text: folderName,
				y_align: Clutter.ActorAlign.CENTER,
				x_expand: true,
			}),
		);

		const menuButton = new St.Button({
			style_class: 'folder-row-menu-button',
			child: new St.Icon({ icon_name: Icon.ViewMore }),
			y_align: Clutter.ActorAlign.CENTER,
		});
		box.add_child(menuButton);

		const menu = new PopupMenu.PopupMenu(menuButton, 0, St.Side.TOP);
		Main.layoutManager.uiGroup.add_child(menu.actor);
		menu.actor.hide();

		const menuManager = new PopupMenu.PopupMenuManager(menuButton);
		menuManager.addMenu(menu);

		menu.addAction(_('Rename'), () => {
			const dialog = new FolderNameDialog(_('Rename Folder'), folderName);
			dialog.connect('confirmed', (_d, newName: string) => this.ext.renameFolder(folderName, newName));
			dialog.open();
		});

		menu.addAction(_('Delete'), () => this.ext.deleteFolder(folderName));

		menuButton.connect('clicked', () => menu.toggle());

		this.connect('destroy', () => menu.destroy());
	}
}

@registerClass({
	Signals: {
		'folder-selected': {
			param_types: [GObject.TYPE_STRING],
		},
	},
})
export class FoldersView extends St.BoxLayout {
	private readonly _list: St.BoxLayout;
	private readonly _emptyLabel: St.Label;

	constructor(private ext: CopyousExtension) {
		super(
			boxLayoutProps({
				style_class: 'folders-view',
				orientation: Clutter.Orientation.VERTICAL,
				x_expand: true,
				y_expand: true,
			}),
		);

		const scrollView = new St.ScrollView({ style_class: 'folders-scrollview', x_expand: true, y_expand: true });
		this.add_child(scrollView);

		this._list = new St.BoxLayout(boxLayoutProps({ orientation: Clutter.Orientation.VERTICAL, x_expand: true }));
		scrollView.child = this._list;

		this._emptyLabel = new St.Label({
			style_class: 'folders-empty-label',
			text: _('No Folders Yet'),
			x_align: Clutter.ActorAlign.CENTER,
			visible: false,
		});
		this.add_child(this._emptyLabel);

		const newFolderButton = new St.Button({
			style_class: 'folder-row new-folder-row',
			can_focus: true,
			x_expand: true,
			label: _('+ New Folder'),
		});
		this.add_child(newFolderButton);
		newFolderButton.connect('clicked', () => {
			const dialog = new FolderNameDialog(_('New Folder'));
			dialog.connect('confirmed', (_d, name: string) => this.ext.createFolder(name));
			dialog.open();
		});

		this.ext.settings.connectObject('changed::folders', this.update.bind(this), this);
		this.update();
	}

	override destroy() {
		this.ext.settings.disconnectObject(this);
		super.destroy();
	}

	override vfunc_map(): void {
		super.vfunc_map();

		// Belt and suspenders: re-read the folder list every time this becomes visible, not just
		// on `changed::folders`, in case anything changed it out from under us.
		this.update();
	}

	private update() {
		this._list.destroy_all_children();

		const folders = this.ext.folders;
		this._emptyLabel.visible = folders.length === 0;

		for (const name of folders) {
			const row = new FolderRow(this.ext, name);
			row.connect('clicked', () => this.emit('folder-selected', name));
			this._list.add_child(row);
		}
	}
}

/**
 * "Move to Folder" submenu for the clipboard item's context menu: None, one entry per existing
 * folder (checked = current), and a "New Folder…" entry that creates one and assigns it in a
 * single step.
 */
@registerClass({
	Signals: {
		'activate-folder': {
			param_types: [GObject.TYPE_STRING],
		},
	},
})
export class FolderSubMenuItem extends PopupMenu.PopupSubMenuMenuItem {
	private _folder: string | null = null;

	constructor(private ext: CopyousExtension) {
		super(_('Move to Folder'));

		this.ext.settings.connectObject('changed::folders', this.rebuild.bind(this), this);
		this.rebuild();
	}

	override destroy() {
		this.ext.settings.disconnectObject(this);
		super.destroy();
	}

	get folder(): string | null {
		return this._folder;
	}

	set folder(folder: string | null) {
		this._folder = folder;
		this.rebuild();
	}

	private rebuild() {
		this.menu.removeAll();

		const noneItem = new PopupMenu.PopupMenuItem(_('None'));
		noneItem.setOrnament(this._folder === null ? PopupMenu.Ornament.CHECK : PopupMenu.Ornament.NONE);
		noneItem.connect('activate', () => this.emit('activate-folder', ''));
		this.menu.addMenuItem(noneItem);

		const folders = this.ext.folders;
		if (folders.length > 0) {
			this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

			for (const name of folders) {
				const item = new PopupMenu.PopupMenuItem(name);
				item.setOrnament(this._folder === name ? PopupMenu.Ornament.CHECK : PopupMenu.Ornament.NONE);
				item.connect('activate', () => this.emit('activate-folder', name));
				this.menu.addMenuItem(item);
			}
		}

		this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

		const newItem = new PopupMenu.PopupMenuItem(_('New Folder…'));
		newItem.connect('activate', () => {
			const dialog = new FolderNameDialog(_('New Folder'));
			dialog.connect('confirmed', (_d, name: string) => {
				this.ext.createFolder(name);
				this.emit('activate-folder', name);
			});
			dialog.open();
		});
		this.menu.addMenuItem(newItem);
	}
}
