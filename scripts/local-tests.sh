#!/bin/sh

set -eu

project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
container_name="wppb-playwright-local-$$"
playwright_version="1.63.0"

# Keep wp-env's generated Docker configuration inside the project when the
# quality gate runs in a restricted or disposable WSL environment.
export WP_ENV_HOME="${WP_ENV_HOME:-$project_root/.wp-env-home}"

cd "$project_root"

npm run composer:install
npm run env:test:start
WPPB_WP_ENV_CONFIG=.wp-env.test.json npm run check
npm run test:plugin-check

if [ -n "${PW_TEST_CONNECT_WS_ENDPOINT:-}" ]; then
	WP_E2E_BASE_URL="${WP_E2E_BASE_URL:-http://localhost:8889}" npm run test:browser
	PW_TEST_CONNECT_WS_ENDPOINT="$PW_TEST_CONNECT_WS_ENDPOINT" npm run test:js:browser
	exit 0
fi

cleanup() {
	docker rm -f "$container_name" >/dev/null 2>&1 || true
}

trap cleanup EXIT HUP INT TERM

docker run --detach --rm --init --shm-size=1g --network host \
	--name "$container_name" \
	--user pwuser \
	--workdir /home/pwuser \
	"mcr.microsoft.com/playwright:v${playwright_version}-noble" \
	npx --yes "playwright@${playwright_version}" run-server \
	--port 9323 --host 127.0.0.1 >/dev/null

attempt=0
until docker logs "$container_name" 2>&1 | grep -q 'Listening'; do
	attempt=$((attempt + 1))
	if [ "$attempt" -ge 30 ]; then
		printf '%s\n' 'Playwright browser server did not become ready.' >&2
		exit 1
	fi
	sleep 1
done

WP_E2E_BASE_URL=http://localhost:8889 \
	PW_TEST_CONNECT_WS_ENDPOINT=ws://127.0.0.1:9323/ \
	npm run test:browser

PW_TEST_CONNECT_WS_ENDPOINT=ws://127.0.0.1:9323/ npm run test:js:browser
