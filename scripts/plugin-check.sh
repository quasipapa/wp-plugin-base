#!/bin/sh

set -eu

project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$project_root"
eval "$(node scripts/lib/print-config.mjs)"
staging_root="$project_root/.plugin-check"
plugin_dir="$staging_root/$SLUG"

trap 'rm -rf "$staging_root"' EXIT HUP INT TERM

rm -rf "$staging_root"
mkdir -p "$plugin_dir"

for file in $PACKAGE_FILES; do
	cp "$file" "$plugin_dir/"
done
for dir in $PACKAGE_DIRS; do
	[ -d "$dir" ] && cp -R "$dir" "$plugin_dir/" || true
done

"$project_root/node_modules/.bin/wp-env" run --config="$project_root/.wp-env.test.json" cli -- \
	wp plugin check "wp-content/plugins/$SLUG/.plugin-check/$SLUG" \
	--require=wp-content/plugins/plugin-check/cli.php \
	--format=strict-table \
	--ignore-codes=block_api_version_too_low,plugin_updater_detected,trademarked_term,PluginCheck.CodeAnalysis.DiscouragedFunctions.load_plugin_textdomainFound

rm -rf "$staging_root"
