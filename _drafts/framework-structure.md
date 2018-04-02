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

This can look appealing but it has down sides that (*IHMO*) are making it unworthy.  
To name a few :
- Updating a driver for a target requires a patch bump for the whole crate where a user may not even
  use this target.
- It lacks flexibility ;
  In order to keep things consistent when you change an API, you need to update **ALL** drivers which
  can be a rather wide range or targets.





