---
layout: post
title: "Embedded Rust: Framework structure"
categories: embedded-rust
tags: rust embedded-dev
date: 2018-04-08 15:12:00 +0100
series: "Embedded Rust"
image: /assets/img/rust-logo-256x256.png
---
There are already some embedded Rust projects such as [tock-os](https://www.tockos.org) or [zync-rs](https://zinc.rs/). They all (AFAIK) took the path to a monolithic API in the sense that they provide everything as a single (potentially) heavy crate that includes all ports and their drivers.

*A single dependency to all your projects* can look appealing, but it has downsides that (*IMHO*) make it unworthy. It greatly impairs maintainability and slows down the release pace because it makes the crate heavier (in features and targets):
- Updating a driver for a single target or family requires a patch bump for the whole framework;
- Keeping things consistent when changing an API requires you to update **ALL** drivers, which can be a tedious task when supporting a wide range or targets;
- It is way too easy to intricate modules' dependencies and end up with a tight knot of internal relations between modules. It goes against the [*KISS principle*](https://en.wikipedia.org/wiki/KISS_principle).

## Decoupling

Splitting the framework in a "galaxy" of lightweight crates allows adoption of updates of the main APIs to be propagated in some sort of *waterfall* way. A team responsible for maintaining a certain set of targets can use semantic versioning to only update the release when it is ready. It adds latency between the main API & the target implementation updates but it prevents :
- highly demanded features to be stuck until all team do implement it ;
- code rot of abandoned targets in the framework crates.

This would also help :
- enforcing a mindful design of APIs and keep them clear between crates ;
- benefit from the semantic versioning of APIs ;
- organise communities around focus groups that wouldn't be limited by slower/less active groups...

This diagram is here to give you a rough idea of what could be achieved. This would of course be extended by more crates dedicated to others tasks such has file system drivers, motor/sensor control (loops?)...

{% comment %}
package silica_linux {}
package silica_rpi {}
package silica_core_sync {}
package silica_core_allocator {}
package silica {}
package silica_cortexm {}
package silica_cortexm_3 {}
package silica_cortexm_4 {}
package silica_stm32f2 {}
package silica_stm32f2x7 {}
package silica_stm32f207zg {}
package silica_nucleo_f207zg {}
package silica_atsam4e {}
package silica_atsam4e8e {}
package silica_l106 {}
package silica_esp8266 {}
package silica_duet {}
package silica_atmel_mega {}
package silica_atmel_mega_2560 {}
package silica_arduino_mega2560 {}


silica_core_allocator <-- silica
silica_core_sync <-- silica

silica <-- silica_cortexm
silica <-- silica_linux
silica <-- silica_l106

silica_linux <-- silica_rpi

silica_cortexm <-- silica_cortexm_3
silica_cortexm <-- silica_cortexm_4

silica_cortexm_3 <-- silica_stm32f2

silica_cortexm_4 <-- silica_atsam4e

silica_stm32f2 <-- silica_stm32f2x7
silica_stm32f2x7 <-- silica_stm32f207zg
silica_stm32f207zg <-- silica_nucleo_f207zg

silica_atsam4e <-- silica_atsam4e8e
silica_atsam4e8e <-- silica_duet

silica_l106 <-- silica_esp8266

silica <-- silica_atmel_mega
silica_atmel_mega <-- silica_atmel_mega_2560
silica_atmel_mega_2560 <-- silica_arduino_mega2560

package silica_demo_blinky {}
silica <-- silica_demo_blinky
silica_nucleo_f207zg <.. silica_demo_blinky
silica_duet <.. silica_demo_blinky
silica_esp8266 <.. silica_demo_blinky
silica_rpi <.. silica_demo_blinky
silica_arduino_mega2560 <.. silica_demo_blinky
' > this is to help gedit's syntax colouring.
{% endcomment %}
![kind of UML diagram]({{ "/assets/img/framework-structure.svg" }})

For example here is how things could be spread :
- `silica`[^1] (api level) :  
  Defines generic traits that exposes features for common resources such as UART, SPI, I²C, ADC, DAC, CAN, Timers...
  It also reexport modules from other *core* crates (such as synchronization primitives etc) ;
- `silica_core_sync` :  
  Provides generic implementations for Mutexes, Semaphores and critical sections. It expects (at least) two external functions to be defined : `fn critical_section_enter()` and `fn critical_section_enter()` ;
- `silica_cortexm` (mcu core level) :  
  Implements Mutexes, Semaphores & critical sections' internals.  
  This is also where is implemented all the os mechanisms are because they are generic to all cortex cores ;
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

## Features

Rust's *Features* are a nice & clean replacement for what used to be done with `#define` in **C**.  
They could be used to select a specific implementation of a given feature.  
The most obvious use case that comes to my mind is a bootloader application requiring that *'no-os'* is provided to get the smallest footprint possible while another app would require a full featured *'RTOS'* with system calls, *os aware* synchronisation primitive implementations primitives. Both apps would depend on the same *target* crate (e.g. `silica_arduino_mega2560`) but with slightly different implementations.

---

[^1]:
    [`silica-rs`](http://github.com/silica-rs) is something I initiated few years ago. It is inspired by something I realized with Makefiles & C in my first company. I wanted a framework that is target, os, ip stack [...] agnostic.

