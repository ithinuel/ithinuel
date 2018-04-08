---
layout: post
title:  "Embedded Rust : Framework structure"
categories: embedded-rust
tags: rust embedded-dev
date: 2018-04-08 15:12:00 +0100
---
There are already some embedded rust projects such as [tock-os](https://www.tockos.org) or [zync-rs](https://zinc.rs/). They all (AFAIK) took the path to a monolithic API in that sense that everything is provided as a single (potentially) heavy crate where all ports and their drivers are provided in the same crate.

*A single dependency to all your projects* can look appealing, but it has downsides that (*IMHO*) are making it unworthy. It greatly impairs maintainability and slows down the release pace because it makes the crate heavier (in features/targets) :
- Updating a driver for a single target/family requires a patch bump for the whole framework ;
- Keeping things consistent when changing an API requires you to update **ALL** drivers which can be a rather tedious task when supporting a wide range or targets.
- It is way too easy to intricate modules' dependencies and end up with a tight knot of internal relations between modules. It goes against the [*KISS principle*](https://en.wikipedia.org/wiki/KISS_principle).

## Decoupling

Splitting the framework in a *"galaxy"* of light weight crates allows adoption of updates of the main APIs to be propagated in some sort of *waterfall* kind of way. A team responsible of maintaining a certain set of target can use the semantic versioning to only update their release when they are ready. It adds latency between the main API & the target implementation updates but it prevents :
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

Note that the *generic crates* such as `silica_core_sync` which provides common synchronisation primitives (Mutexes/Semaphores/critical sections) will call `extern "Rust"` functions that will have to be implemented by other crates such as `silica_atmel_mega` or `silica_cortexm`.

## Features

Rust's *Features* are a nice & clean replacement for what used to be done with `#define` in **C**.  
They could be used to select a specific implementation of a given feature.  
The most obvious use case that comes to my mind is a bootloader application requiring that *'no-os'* is provided to get the smallest footprint possible while another app would require a full featured *'RTOS'* with system calls, *os aware* synchronisation primitive implementations primitives. Both apps would depend on the same *target* crate (e.g. `silica_arduino_mega2560`) but with slightly different implementations.

