---
layout: post
title:  "Embedded Rust : Why ?"
date:   2018-03-30 09:26:00 +0100
categories: embedded-rust
tags: rust embedded-dev
---
I will try to publish here a series of articles about my approach to embedded development and how I plan to achieve that in Rust.
Embedded system development is not so far from regular application development in that we want it :
- Secure *(no secret leakage)* ;
- Safe *(no external damage)* ;
- Maintainable *(will never cost more to fix than rewrite)* ;
- and Flexible *(same as before 😉)*.

However, the deeply embedded world has some additionnal constraints such as :
- Memory Size *(only few KiB)* ;
- core frequency *(240MHz is the fastests MCU I've played with so far)* ;
- core ISA *(vectorized double precision float computation is not available on all MCU 😲)* ;
- Single core *(There are some multicore MCU but they're clearly a drop in the ocean)* ;
- no OS such Android/Linux/iOS/Windows *(a curse & a bless at the same time)* ;
- No MMU so no virtual memory space ;
- Diversity/inconsistency of platforms...

It is also well known that the world is higly unpredictable and if one thing is pretty certain is
that the product will fail at some point. In that case we often cannot afford  to ask someone (a
customer or an agent) to reboot or powercycle the device. We want it to be bug free or at least able to
recover on its own. We also want (at least during dev phase) the system to tell us *if/when/why*
such a dramatic failure occured.

And as if it wasn't yet too complicated, the industry itself adds its own contraints to this soup.
The "volatility" of devs requires the handover process to be as efficient as possible not to impair
the "productivity". I mean that while handing over a project, people should focus on the product
itself rather than the tools used to *build/generate/deploy/debug/...* it.

In the next posts I'll talk about the following topics (links will be added as the acticles get
published) :

- Foundations
  - Framework structure :   
    Crates & feature gates to the rescue...
  - Resource management :    
    GPIO and other peripherals...
  - Threadless, Co-operative & Pre-emptive multitasking   
    One driver to rule them all !
  - Execution context types   
    *main* -- thread -- interrupt   
    Context switching & safety
  - Critical failure handling
- Framework   
  Cross crate tools -- logging

I know that all this might sound/look pretty abstract. To make this slightly more concrete, I'll
use as a demo project an IoT enabled 3D printer (based on my Anet A6 & Flsun 3). I'll start working
on a Cortex-M based motherboard as AVR is not yet supported in the mainstream rust compiler. However,
as I want this framework to be cross platform, the same application code must run on all targets
seemlessly.

