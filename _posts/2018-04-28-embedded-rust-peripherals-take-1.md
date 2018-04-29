---
layout: post
title: "Embedded Rust : Peripherals (and low-level stuffs) - take 1"
categories: embedded-rust
tags: rust embedded-dev
date: 2018-04-28 01:00:00 +0100
series: "Embedded Rust"
image: /assets/img/rust-logo-256x256.png
---
First of all, *low level stuffs* such as peripheral drivers should be hidden from the application developer. He should not be able to access directly the registers and mess with the peripheral states/control. The wrong flag in the wrong register can lead to dramatic failures and even damages to the products.

Accesses to peripheral registers are also special in that they should not optimised out byte the compiler when accessed in loops. This is done in C by using the `volatile` qualifier and in rust via `pub unsafe fn core::ptr::read_volatile<T>(src: *const T) -> T` and `pub unsafe fn core::ptr::write_volatile<T>(dst: *mut T, src: T)`. To make it easier to use we can wrap these two calls in a generic *newtype* `VolatileCell<T>`.  Registers will be declared using global `Unique<T>` and thus not be movable. The reference can still be cloned but we can't really prevent that as anybody can still create an unsafe pointer to any location.

Rust doesn't provide any way (at the time writing) to declare and represent a non-byte-aligned type. So it is not possible to describe in a structure a register such as the [Application Interrupt and Reset Control Register](http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0553a/CIHFDJCA.html) from the ARM Cortex-M4 System Control Block the way we would do in C.

Luckily @dzamlo has made a very good [`rust-bitfield`](https://github.com/dzamlo/rust-bitfield) crate for that purpose. Amongst the use cases that `rust-bitfield` covers, the one that fits the most our need is this one :

```rust
#[macro_use]
extern crate bitfield;

bitfield! {
  pub struct AnyRegister(u32);
  impl Debug;
  u32;
  pub read_only_field, _: 2, 0;
  pub _, write_only_field: 5, 4;
}
```

This creates a *newtype* that implements few accessor methods that in turn fall back to implementations of the `Bit` and `BitRange` traits on this *newtype*. This is very nice and simple to use.

The crates implements the `Bit` trait for any type that implements `BitRange<u8>` and provides two implementations of `BitRange`. The first one accesses a field in an integer by shifting/masking and the second accesses a field from an array by looping and extracting each bit one by one.

In our use case we would need :
- the bit field to extract information from a `VolatileCell` ;
- to implement in some cases a set of accessors specific to a register (for example protected with a write key).

In order to fulfil our first requirement, we would only need to implement `BitRange<T>` including `BitRange<u8>` for `VolatileCell<U>` as the `bitfield!` macro will automatically implement `BitRange` for us and use the inner type's implement of `BitRange`.

```rust
macro_rules! impl_bitrange_for_vc_tu {
    ($t:ty, $u:ty) => {
        impl BitRange<$t> for VolatileCell<$u> {
            fn bit_range(&self, msb: usize, lsb: usize) -> $t {
                debug_assert!(msb < size_of::<$u>()*8, "The msb must be smaller than the cell size.");
                let width = msb - lsb + 1;
                debug_assert!(width <= size_of::<$t>()*8,
                              "The field must be smaller that the return type");
                let mask = (1 << width) - 1;
                ((self.read() >> lsb) & mask) as $t
            }
            fn set_bit_range(&mut self, msb: usize, lsb: usize, value: $t) {
                debug_assert!(msb < size_of::<$u>()*8, "The msb must be smaller than the cell size.");
                let width = msb - lsb + 1;
                let mask = (1 << width) - 1;
                self.update((value as $u) << lsb, mask << lsb)
            }
        }
    }
}
impl_bitrange_for_vc_tu!(u8,  u8);

impl_bitrange_for_vc_tu!(u8,  u16);
impl_bitrange_for_vc_tu!(u16, u16);

impl_bitrange_for_vc_tu!(u8,  u32);
impl_bitrange_for_vc_tu!(u16, u32);
impl_bitrange_for_vc_tu!(u32, u32);
```

However for the second requirement, we need to opt-out from the default implementation provided by the `bitfield!` macro and implement `BitRange` by ourselves.
```rust
bitfield! {
  /// Application Interrupt and Reset Control Register
  /// Described here : http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0553a/CIHFDJCA.html
  pub struct AIRCRegister(VolatileCell<u32>);
  no default BitRange; // this feature is on PR at the time writine these lines.
  impl Debug;
  u8;
  pub _, sys_reset_req: 2;
  pub prigroup, set_prigroup: 10, 8;
  pub endianness, _: 15;
}
// as all fields are thinner than a byte we only need to implement the u8 version
// (it offers the `Bit` trait impl in bonus).
impl BitRange<u8> for AIRCRegister {
    fn bit_range(&self, msb: usize, lsb: usize) -> u8 {
        self.0.bit_range(msb, lsb)
    }

    fn set_bit_range(&mut self, msb: usize, lsb: usize, value: u8) {
        debug_assert!(msb < size_of::<Self>()*8, "The msb must be smaller than the cell size.");
        let width = msb - lsb + 1;
        let mask = (1 << width) - 1;

        self.0.write((0x05FA << 16) | (((value as u32) & mask) << lsb));
    }
}
```

This is very nice as it covers all the thing we need to start working rather safely with a target, but there are still few *issues* that I would like to address :
- It allows anyone to mess with the bitfield by directly invoking the methods from `BitRange`.
- It exposes the inner type and allows anybody to access the inner value directly.
- A type can only implement one bitordering. We need to declare a register twice if we want, for example, to decode/encode a rx/tx register and change it's bitordering on the fly. That means having two references pointing at the same time to the same location but with different types.
- There is no support for variable endianness. For example in a FPGA that have peripherals with different endianness.
- A bitfield based on a slice is actually a generic *newtype* that can accept any inner type. Using the *newtype* with an invalid inner type would be silent at compile time until someone actually tries to use a bitfield from this instance.

In the "**take - 2**", I will detail what I came out with and how it answers these concerns.
