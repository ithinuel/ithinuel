---
layout: post
title:  "Framework structure : Crates & feature gates to the rescue..."
categories: embedded-rust
tags: rust embedded-dev
---
I know that there are already some rust for embedded projects such as [tock-os](https://www.tockos.org)
or [zync-rs](https://zinc.rs/).  
They all (as far as I know) took the path to a monolithic API in that sense that everything is
provided as a single (potentially) heavy crate where all ports and their drivers are provided in the
same crate.

This can look appealing but it has down sides that (*IHMO*) are making it unworthy. The biggest
negative point to me is that it greatly impairs maintainability & slows down the release pace.  
Because the crates is heavy (in features/targets) :
- Updating a driver for a target requires a patch bump for the whole crate where a user may not even
  use this target.
- Keeping things consistent when changing an API requires you to update **ALL** drivers which can be
  a rather tedious task when supporting a wide range or targets.

**Decoupling**

I think splitting the framework in a "galaxy" of light weight crates allows adoption of updates of
the main APIs to be realized in a *waterfall* kind of way. A team responsible of maintaining a certain
set of target can use the semantic versioning to only update their release when they are ready. It
adds latency between the main API & the target implementation updates but it prevents :
- highly demanded features to be stuck while a all team do implement it ;
- rotting abandoned targets in the main crates.

This way, the community can group in different team focusing on specific aspect/targets of the
framework without having to wait on other team to publish their work.

This diagram is here to give you a rough idea of what I imagine. This can/will of course be extended
by more crates dedicated to others tasks such has filesystem drivers, motor/sensor control (loops?)...

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

package silica_demo_blinky {}
silica <-- silica_demo_blinky
silica_nucleo_f207zg <.. silica_demo_blinky
silica_duet <.. silica_demo_blinky
silica_esp8266 <.. silica_demo_blinky
silica_rpi <.. silica_demo_blinky
{% endcomment %}
![kind of UML diagram]({{ "/assets/img/framework-structure.svg" }})
