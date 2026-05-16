---
title: "VMAs, sbrk(), and mmap(): How Linux Actually Manages Process Memory"
date: "2026-05-17"
excerpt: "A deep dive into sbrk, mmap, and how the kernel actually manages process memory."
---

Linux doesn’t really think in terms of “heap memory” or “stack memory”.
It thinks in terms of **virtual memory regions**.

More specifically:

> Linux manages process memory using VMAs (Virtual Memory Areas).

Understanding VMAs completely changed how I thought about allocators, heaps, stacks, and even page faults.

---

# Virtual Address Space

Every process runs inside its own virtual address space.

A simplified layout looks like this:

```text
low addresses
┌─────────────────────┐
│   .text             │
│   .data / .bss      │
│                     │
│   heap              │ 
│                     │
│                     │
│    unmapped void    │
│                     │
│                     │
│   stack             │ 
│                     │
└─────────────────────┘
high addresses
```

Each region is represented by its own VMA.

---

# What Is a VMA?

A VMA (Virtual Memory Area) is simply a kernel data structure describing a valid region inside a process's virtual address space.

A process typically has many VMAs:

```text
VMA list for a process:
┌─────────────────────────────────────────────────────┐
│ VMA 1: 0x400000 → 0x401000  | READ+EXEC | .text     │
│ VMA 2: 0x401000 → 0x402000  | READ+WRITE| .data/.bss│
│ VMA 3: 0x7ff000 → 0x800000  | READ+EXEC | libc.so   │
│ VMA 4: 0x801000 → 0x802000  | READ+WRITE| libc.so   │
│ VMA 5: 0xA00000 → 0xA10000  | READ+WRITE| heap      │
│ VMA 6: 0x7fff000→ 0x8000000 | READ+WRITE| stack     │
└─────────────────────────────────────────────────────┘
```

Everything between them is just unmapped virtual space.

A VMA is not memory itself, it's just metadata describing:

* a virtual address range
* permissions
* mapping information
* backing source

A VMA would look something like this:

```c
struct vm_area_struct {
    unsigned long vm_start;
    unsigned long vm_end;
    unsigned long vm_flags;
    struct file *vm_file;
};
```

No physical memory is touched so far.

---

# Lazy Allocation

When a VMA is created:

* physical pages are usually **not allocated immediately**
* page table entries may not exist yet
* the kernel simply records that the address range is valid

Actual memory is allocated lazily.

The lifecycle when you access memory

```text
1. you access virtual address 0x400000
        ↓
2. MMU checks page table — no entry yet → PAGE FAULT
        ↓
3. kernel checks VMAs — is 0x400000 inside a valid VMA?
        ↓
   YES → allocate a physical page, create page table entry → continue
   NO  → SIGSEGV (segfault)
```

---

# `sbrk()`

> `sbrk()` extends the existing heap VMA.

The heap maintains something called the **program break**.

This marks the current end of the heap.

Before:

```text
heap VMA
[========|   ]
          ↑
    program break
```

After `sbrk(4096)`:

```text
heap VMA
[============| ]
              ↑
       program break
```

The heap VMA itself grows downward into the unmapped space.

Important properties of `sbrk()`:

* modifies one existing VMA (the heap)
* contiguous linear growth only
* heap-specific
* difficult to free memory in the middle

This is one of the biggest limitations.

Since the heap is one continuous region:

* you cannot easily punch holes into it
* memory can only truly shrink if the topmost region becomes free

---

# `mmap()`

`mmap()` works very differently.

Instead of extending the heap:

> `mmap()` creates an entirely new independent VMA.

Example:

Before:

```text
┌─────────────────────┐
│       heap          │
├─────────────────────┤
│                     │
│    unmapped void    │
│                     │
│       stack         │
└─────────────────────┘
```

After `mmap()`:

```text
┌─────────────────────┐
│       heap          │
├─────────────────────┤
│                     │
│     NEW VMA         │
│                     │
│    unmapped void    │
│                     │
│       stack         │
└─────────────────────┘
```

The heap remains untouched.

The kernel simply finds free virtual address space and creates a brand new VMA there.

This makes `mmap()` much more flexible.

Properties of `mmap()`:

* creates independent VMAs
* not tied to heap
* can map files
* can create shared memory
* easy to release via `munmap()`
* allocations do not need to be contiguous

---
# Which syscall do modern allocators actually use? 
Modern allocators use a hybrid approach; they typically use:

* `sbrk()` for small allocations
* `mmap()` for large allocations

Large allocations are often mapped separately because:

* they can be returned to the OS immediately
* fragmentation becomes easier to manage
* allocator flexibility improves significantly

---

# Looking at Real VMAs

Linux exposes a process's VMAs through:

```bash
cat /proc/self/maps
```

Example output:

```text
55a3b2000000-55a3b2001000 r-xp /usr/bin/cat
7f8a1c000000-7f8a1c200000 r--p /lib/libc.so
7ffde4000000-7ffde4021000 rw-p [stack]
```

Each line represents a VMA.

Most processes have dozens of them.

---

# Final Thought

The key insight that finally made everything click for me was this:

> `sbrk()` modifies an existing VMA.
> `mmap()` creates entirely new VMAs.

Memory isn't just one giant array of bytes.

It's a collection of:
* virtual regions
* mappings
* permissions
* lazy allocation
* ownership

Which is much closer to how the kernel actually sees a process.
