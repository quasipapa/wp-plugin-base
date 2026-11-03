#!/bin/sh

set -eu

project_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$project_dir"
eval "$(node scripts/lib/print-config.mjs)"

package_name=$SLUG
output_dir=${1:-"$project_dir/dist"}
staging_dir=$(mktemp -d "${TMPDIR:-/tmp}/${package_name}.XXXXXX")
staging_plugin="$staging_dir/$package_name"
zip_path="$output_dir/$package_name.zip"
checksum_path="$output_dir/$package_name.zip.sha256"

cleanup() {
	 rm -rf "$staging_dir"
}
trap cleanup EXIT INT TERM

mkdir -p "$output_dir"
rm -f "$zip_path" "$checksum_path"

npm run build

mkdir -p "$staging_plugin"
for file in $PACKAGE_FILES; do
	cp "$file" "$staging_plugin/"
done
for dir in $PACKAGE_DIRS; do
	[ -d "$dir" ] && cp -R "$dir" "$staging_plugin/" || true
done

python3 - "$staging_dir" "$zip_path" <<'PY'
import os
import sys
import zipfile

staging_dir, zip_path = sys.argv[1:]
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as archive:
    for root, directories, files in os.walk(staging_dir):
        directories.sort()
        files.sort()
        for filename in files:
            path = os.path.join(root, filename)
            archive_path = os.path.relpath(path, staging_dir)
            info = zipfile.ZipInfo(archive_path, date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            with open(path, 'rb') as source:
                archive.writestr(info, source.read())
PY

(cd "$output_dir" && sha256sum "$package_name.zip") > "$checksum_path"
printf 'Created %s\n' "$zip_path"
printf 'Created %s\n' "$checksum_path"
