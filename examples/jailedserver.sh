#!/usr/bin/env sh

./bin/carapace --hook-port 5060 --hook-host localhost --plugin chroot --plugin chdir --chroot ./examples/chroot-jail --chdir . server.js --port 1337
