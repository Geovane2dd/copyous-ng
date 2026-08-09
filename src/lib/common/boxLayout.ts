import Clutter from 'gi://Clutter';
import St from 'gi://St';

const HAS_ORIENTATION = 'orientation' in St.BoxLayout.prototype;

/**
 * `St.BoxLayout` only gained an `orientation` constructor property in GNOME 48 (before that,
 * only the boolean `vertical` existed) -- `Error: No property orientation on StBoxLayout` on
 * GNOME 46/47. Normalizes `orientation` into `vertical` when the real property isn't there.
 */
export function boxLayoutProps<T extends { orientation?: Clutter.Orientation }>(
	props: T,
): Omit<T, 'orientation'> & { vertical?: boolean } {
	if (HAS_ORIENTATION || !('orientation' in props)) return props;

	const { orientation, ...rest } = props;
	return { ...rest, vertical: orientation === Clutter.Orientation.VERTICAL };
}

/**
 * Reads/writes orientation post-construction, e.g. for use in a plain (non-GObject-property)
 * getter/setter pair -- `GObject.Object.bind_property()` requires both ends to be real,
 * registered GObject properties, which `orientation` isn't pre-48.
 *
 * Uses the `get_orientation()`/`set_orientation()` GI method bindings rather than the
 * `.orientation` JS property: a caller overriding its own `orientation` accessor (to expose it
 * on a class where it isn't a native property pre-48) would otherwise recurse into itself when
 * `box` is `this` and the native property *does* exist (GNOME 48+).
 */
export function getBoxLayoutOrientation(box: St.BoxLayout): Clutter.Orientation {
	if (HAS_ORIENTATION) return (box as St.BoxLayout & { get_orientation(): Clutter.Orientation }).get_orientation();
	return (box as St.BoxLayout & { vertical: boolean }).vertical
		? Clutter.Orientation.VERTICAL
		: Clutter.Orientation.HORIZONTAL;
}

export function setBoxLayoutOrientation(box: St.BoxLayout, orientation: Clutter.Orientation): void {
	if (HAS_ORIENTATION) {
		(box as St.BoxLayout & { set_orientation(orientation: Clutter.Orientation): void }).set_orientation(
			orientation,
		);
	} else {
		(box as St.BoxLayout & { vertical: boolean }).vertical = orientation === Clutter.Orientation.VERTICAL;
	}
}
