---
layout: post
title:  "Tips & tricks: GDB reload firmware"
date:   2020-09-27 21:30:00 +0100
series: "Tips & Tricks"
categories: tip-and-tricks
tags: tip-and-tricks gdb
---

Rust is a fantastic language to work with. I particularly love `cargo watch -x 'build --target thumbv7em-none-eabihf'`
that automatically rebuilds the firmware for me whenever I save a change in my favorite editor
(neovim 🥰).

However a rather annoying thing is that I have to exit and relaunch GDB to reload the elf of that
firmware. That was until I got fed up with this and looked for a solution that for sure existed.

I now have this snippet in addition to the [usual rust gdb script](https://github.com/rust-embedded/cortex-m-quickstart/blob/master/openocd.gdb) :

```python
# defines the reload command
define reload
    # reload symbols
    python gdb.execute("file " + gdb.current_progspace().filename)
    # clear cache
    directory

    # flash
    load
    # start
    monitor reset halt
    stepi
end

# defines a short hand to the reset command
define reset
    monitor reset halt
end

reload
```

I can now simply enter `reload` in **gdb** to reload the elf file in gdb as well as reflashing the
target memory with this freshly loaded firmware.
