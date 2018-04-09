---
layout: post
title: "Embedded Rust : Framework structure bis"
categories: embedded-rust
tags: rust embedded-dev
series: "Embedded Rust"
image: /assets/img/rust-logo-256x256.png
---

While reading the previous article I realized that I forgot to say what is `silica-rs` and why do I have so many crates between the `silica` crate and the actual app (aka `blinky`).

So, long story short, `silica-rs` is something I initiated few years ago as a common name for all the things I did. Similarly to the unified framework I built in my company from C modules & a few makefile macro to handle dependencies, I wanted a unique framework that would be target, os, ipstack etc agnostic.
Its sole objective would be to provide a unified API that any module could implement the way it wants.

Next, in regards to the crates, here is a break down of what each crate would provide :
- `silica` (api level) :  
  Defines generic traits that exposes features for common resources such as UART, SPI, I²C, ADC, DAC, CAN, Timers...
  It also reexport modules from other *core* crates (such as synchronization primitives etc) ;
- `silica_core_sync` :  
  Provides generic implementations for Mutexes, Semaphores and critical sections. It expects (at least) two extern functions to be defined : `fn critical_section_enter()` and `fn critical_section_enter()` ;
- `silica_cortexm` (mcu core level) :  
  Implements Mutexes, Semaphores & critical section internals.  
  This is also where is implemented all the os mecanisms are because they are generic to all cortex cores ;
- `silica_cortexm_4` :  
  Implements extra traits that cover cases that can be handled/accelerated by hardware specific features ;
- `silica_atsam4e` (chip level) :  
  Implements drivers for all peripherals that are common to this family ;
- `silica_atsam4e8e` :  
  Exports all symbols related to peripheral instances, gpios etc ;
- `silica_duet` (module/board level) :  
  Exports a subsets of gpio and determine the configuration of most peripherals. It may also contain board specific configuration such as external clock frequency, gpio that are actually always output with a low active level etc.
- `silica_demo_blinky` (application level) :  
  Implements the actual application. It may contain some code specific to a target that would be feature gated.


