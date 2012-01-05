#!/usr/bin/env sh

./bin/carapace --plugin chroot --plugin chdir --chroot ./examples/chroot-jail --chdir . server.js --port 1337
