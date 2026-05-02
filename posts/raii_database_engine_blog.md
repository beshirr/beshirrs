---
title: "RAII in a Database Engine: Clean Abstraction or Hidden Footgun?"
date: "2026-05-02"
excerpt: "Why RAII page guards can improve correctness in a buffer pool, and where they still bite."
---

In a storage engine,  
Who is responsible for marking pages as dirty, and when?

A basic simple approach in buffer pool design would look like this:

- Return raw Page*
- Let callers modify memory directly
- Mark pages dirty when calling UnpinPage

This might seems reasonable:  
Modify → Unpin → mark dirty  

But in this case:  
Correctness depends on the caller remembering to do the right thing.  
That's not safe enough.

If a developer forgets to mark a page as dirty after modifying it:

- The buffer pool may evict the page without flushing  
- Changes are silently lost  
- No obvious crash - just incorrect state  

A more robust design should guarantee:

- Pages are marked dirty immediately after modification  
- Pinned pages are always eventually released (unpin is never forgotten)  

And ideally:

These guarantees should be enforced by the API - not by convention.

---

## Two Approaches

There are two primary ways to manage page lifetime and mutation in a buffer pool.

### 1. Manual Lifecycle Management

Example:

```cpp
Page* p = bpm.FetchPage(id);
Modify(p->GetData());
// (true) flags dirty page
bpm.UnpinPage(id, true); // caller must remember this
```

**Pros**

- Simple and explicit  
- Flexible control over lifecycle  

**Cons**

- Easy to forget UnpinPage  
- Easy to forget marking dirty  
- No enforcement of correctness  
- Bugs are silent and hard to trace  

---

### 2. RAII-Based Guards

Instead of returning raw pointers, the buffer pool returns guard objects that manage page lifetime.

Example:

```cpp
{
    auto page = bpm.FetchPageWrite(id);
    Modify(page.GetData());
} // automatically: mark dirty + unpin
```

Two types of guards:

- ReadPageGuard  
- WritePageGuard  

---

### Write Guard Behavior

- Provides mutable access to page data  
- On destruction:
  - Marks the page as dirty  
  - Unpins the page  

**Pros**

- Enforces cleanup automatically  
- Eliminates forgotten UnpinPage  
- Ensures dirty marking is not skipped  
- Encodes correctness into the API  

**Cons**

- Lifetime is tied to scope  
- Easy to accidentally hold resources too long  
- Requires more discipline in structuring code  

---

## Critical Rule: Guards Must Be Move-Only

This is non-negotiable.

If guards are copy-able:

```cpp
auto g2 = g1;
```

You now have:

- Two objects managing the same page  
- Two destructors calling Unpin  

This leads to:

- Double unpin  
- Broken pin counts  
- Undefined behavior  

So guards must be:

- Non-copyable  
- Move-only  

Conceptually similar to `std::unique_ptr`.

---

## The Real Tradeoff

RAII doesn't eliminate problems - it moves them.

With RAII, a misuse looks like this:

```cpp
auto page = bpm.FetchPageWrite(id);
// ... long or complex logic ...
// page remains pinned the entire time
```

**Effect:**

- Page cannot be evicted  
- Buffer pool capacity shrinks  
- Under pressure → pool can become fully pinned  

---

## Design Guidelines

If you adopt RAII guards in a buffer pool:

- Keep guard lifetimes as short as possible  
- Avoid passing guards across layers unnecessarily  
- Treat guards like locks, not just access handles  

---

## Conclusion

RAII-based guards are generally the stronger design for storage engines:

- They enforce correctness by default  
- They remove reliance on human discipline for critical invariants  

But they introduce a different responsibility:

Managing scope becomes just as important as managing correctness.

RAII doesn't make the system foolproof -   
it just makes the failure modes more explicit.

---

## API Reference

Full API (including FetchPageRead, FetchPageWrite, and guard behavior):  
https://github.com/beshirr/EEP-DB/blob/main/docs/storage_api.md
