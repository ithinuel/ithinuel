---
layout: post
title: "Brewing your own Rust toolchain"
categories: rust
tags: rust toolchain
image: /assets/img/rust-logo-256x256.png
date:   2018-05-15 23:14:00 +0100
---
Assuming you already have rustup with a (stable or beta) toolchain installed, the
following list of shell commands will get you a fresh homebrewed Rust toolchain.

```sh
git clone git@github.com:rust-lang/rust.git
cd rust
# switch branch here at will !

# This builds the extended rust for your machine using your local rust.
./configure --enable-extended --tools=rsl,rustmft,src --prefix=~/.local --enable-local-rust
./x.py install

# This makes rustup aware of your toolchain
rustup link myrust $HOME/.local

# builds rust for the specified targets but skips docs
./configure --disable-docs --prefix=~/.local --enable-local-rust
# We might for fun add here more targets such as msp430 or avr
# There may be a way to directly install the newly built targets but I couldn't find it
./x.py dist --target=thumbv7em-none-eabihf,thumbv7em-none-eabi,thumbv7m-none-eabi,thumbv6m-none-eabi
pushd build/dist
for f in $(ls rust-std*.tar.xz); do tar xf $f; done
for d in $(ls -d rust-std*/); do pushd $d; ./install.sh --prefix=$HOME/.local; popd; done
```

You can even `rustup default myrust` if you dare!
