# Version matrix

Authoritative supported-platform values. When a version changes, update the
authoritative configuration and every coupled reference together.

| Concern | Value | Applies to |
| --- | --- | --- |
| Supported WordPress minimum | `6.1` | Installed plugin runtime |
| Supported PHP minimum | `8.0` | Installed plugin runtime and compatibility analysis |
| Node.js minimum and CI selection | `22.22.2` | Local development, CI and release workflow |
| npm minimum | `10.2.3` | Local development |
| Composer | `2.9.5` | Local container commands and CI PHP jobs |
| Playwright | `1.63.0` | Browser test package, server and container image |
| Daily WordPress | current stable release when provisioned | Local manual development |
| Daily PHP | `8.3` | Local manual development |
| Integration WordPress | `6.6` | Isolated WordPress, browser and Plugin Check tests |
| Integration PHP | `8.3` | Isolated WordPress, browser and Plugin Check tests |
| CI PHP matrix | `8.0, 8.3` | PHP lint and unit jobs |
| GitHub runner | `ubuntu-24.04` | CI and release jobs |
