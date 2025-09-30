#!/bin/sh

if [ -z "$husky_skip_init" ]; then
  debug () {
    [ "$HUSKY_DEBUG" = "1" ] && printf "husky (debug) - $1\n"
  }

  readonly hook_name="$(basename "$0")"
  debug "starting $hook_name..."
fi
