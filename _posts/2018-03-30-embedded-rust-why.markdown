---
layout: post
title:  "Embedded Rust: Why ?"
date:   2018-03-30 09:26:00 +0100
series: "Embedded Rust"
categories: embedded-rust
tags: rust embedded-rust
image: /assets/img/rust-logo-256x256.png
---

*Foreword:* I assume in this series that you are :
- A bit familiar with rust-lang terminology (for example, you know what a crate or a trait is);
- Familiar with embedded system design and embedded software development.

If you want to learn more about [Rust](https://rust-lang.org), I encourage you to read [The Book](https://doc.rust-lang.org/book/first-edition/). You can find all the documentation you need on the [rust-lang documentation page](https://doc.rust-lang.org/).

---

I will try to publish here a series of articles about my approach to embedded development and how I plan to achieve that in Rust.
Embedded system development is not so far from regular application development in that we want it:
- Secure *(no secret leakage)*;
- Safe *(no external damage)*;
- Maintainable *(will never cost more to fix than rewrite)*;
- And flexible *(same as before 😉)*.

However, the deeply embedded world has some additional constraints such as:
- Memory size *(only few KiB)*;
- Core frequency *(240MHz is the fastest MCU I've played with so far)*;
- Core ISA *(vectorized double precision float computation is not available on all MCU 😲)*;
- No OS, such as Android/Linux/iOS/Windows *(a curse and a blessing at the same time)*;
- No MMU so no virtual memory space;
- Diversity and inconsistency of platforms.

It is also well known that the world is highly unpredictable and if one thing is pretty certain, it is
that the product will fail at some point. In that case, we often cannot afford  to ask someone (a
customer or an agent) to reboot or power cycle the device. We want it to be bug free or at least able to
recover on its own. We also want (at least during dev phase) the system to tell us *if/when/why*
such a dramatic failure occurred.

And as if it wasn't yet too complicated, the industry itself adds its own constraints to this soup.
The "volatility" of devs requires the handover process to be as efficient as possible not to impair
the "productivity". I mean that while handing over a project, people should focus on the product
itself rather than the tools used to *build/generate/deploy/debug/...* it.

In the next posts I'll talk about the following topics (links will be added as the articles get
published):

- Foundations
  - [Framework structure]({{ "/embedded-rust-framework-structure" | absolute_path }}) :  
    Crates and feature gates to the rescue...
  - Resource management:  
    GPIO and other peripherals
  - Threadless, co-operative and pre-emptive multitasking:  
    One driver to rule them all!
  - Execution context types:  
    *main* -- thread -- interrupt  
    Context switching & safety
  - Critical failure handling
- Framework  
  Cross crate tools -- logging

I know that all this might sound/look abstract. To make this more concrete, I'll
use as a demo project an IoT enabled 3D printer (based on my Anet A6 and Flsun 3D). I'll start working
on a Cortex-M based motherboard because AVR is not yet supported in the mainstream Rust compiler. However,
as I want this framework to work across platforms, the same application code must run on all targets
seamlessly.

