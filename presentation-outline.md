# Single-Threaded HTTP Servers — Presentation Outline

## 1. Why Single-Threaded?

### The Timing Table
| Operation              | Time     | CPU cycles wasted if blocking |
|------------------------|----------|-------------------------------|
| L1 cache read          | ~1ns     | 0                             |
| RAM read               | ~100ns   | ~100                          |
| SSD read               | ~100μs   | ~100,000                      |
| DB query (network)     | ~10ms    | ~10,000,000                   |
| External API call      | ~100ms   | ~100,000,000                  |

### Key Arguments
- Multithreaded server threads do nothing 99.9% of the time — just waiting for DB or file responses
- The OS kernel already multiplexes network I/O (epoll/kqueue/IOCP) — adding threads on top is redundant for I/O-bound workloads
- Each idle thread costs ~1MB stack memory: 1000 connections = ~1GB wasted
- A single-threaded event loop uses DB wait time to serve other requests

### The Core Question for the Audience
"Why are we paying the cost of threads when the CPU isn't the bottleneck?"

### How Node.js Event Loop Handles Concurrent Requests

```
Request A arrives ──→ [Execute code ~0.1ms] ──→ [Send DB query] ──→ (waiting...)
                                                       │
                      Event loop is FREE, picks up:    ↓
Request B arrives ──→ [Execute code ~0.1ms] ──→ [Send DB query] ──→ (waiting...)
                                                       │
                      Event loop is FREE, picks up:    ↓
Request C arrives ──→ [Execute code ~0.1ms] ──→ [Send DB query] ──→ (waiting...)
                                                       │
                      ┌────────────────────────────────┘
                      ↓
              DB response for A arrives ──→ [Execute code ~0.1ms] ──→ Send Response A
              DB response for C arrives ──→ [Execute code ~0.1ms] ──→ Send Response C
              DB response for B arrives ──→ [Execute code ~0.1ms] ──→ Send Response B
```

**One thread, three requests handled concurrently:**
- Total time: ~10ms (one DB round-trip)
- Without event loop (sequential): ~30ms (three DB round-trips)
- The `await` keyword is where the event loop "parks" the request and picks up the next one

### Comparison: Three Approaches to Concurrency

| Model | Example | Code style | Resource cost | How it works |
|---|---|---|---|---|
| Thread per request | Java (traditional), PHP-FPM | Synchronous | ~1MB per connection | OS manages threads |
| Event loop | Node.js | async/await | ~1KB per connection | Single thread, kernel I/O notifications |
| Goroutines | Go | Synchronous | ~2-8KB per connection | Runtime scheduler on few OS threads |

- **Threads**: simple code, wasteful resources
- **Event loop**: efficient resources, but async/await complexity spreads through code
- **Goroutines**: efficient resources AND simple-looking code — the runtime handles switching transparently

---

## 2. Code Loading and Runtime Behavior

### All Runtimes Load Code to RAM at Startup
- Node.js: reads files → compiles to bytecode (V8) → JIT-compiles hot paths to native code
- Go: compiled to native binary ahead of time
- Java: compiled to bytecode (.class) ahead of time → JVM JIT-compiles at runtime
- PHP: reads files → compiles to opcode at startup (long-running) or per-request (FPM)

### Key Insight
- "PHP reloads files on every request" is not special — it's PHP restarting the process on every request
- Long-running PHP processes behave identically to Node.js/Go — code changes require restart

---

## 3. Runtime Assumptions and Hidden Antipatterns

### How PHP-FPM Actually Works
- PHP-FPM maintains a **pool of long-lived worker processes**
- **Without OPcache**: reads and compiles files on every request (slow, rare in production)
- **With OPcache**: compiled opcode stored in shared memory — file reading cost paid only once
- Code is cached, but **application state resets on every request** — all variables, objects, connections

### The Antipattern: Relying on State Reset
- Developers store request-scoped data in global/static variables, knowing the next request starts fresh
- This works in PHP-FPM — but becomes a **bug** when the same code runs in:
    - A long-running queue worker (RabbitMQ consumer)
    - A Swoole or RoadRunner server (long-running PHP HTTP servers)
    - Any other long-running context
- Result: data leaks across requests — User A's data appears in User B's response
- This is not just a bug — it's a **security vulnerability**

### Key Insight
- Runtime assumptions leak into code design
- Code written for one execution model can silently break in another
- Understanding the execution model is not optional — it determines what patterns are safe

---

## 4. Caching Strategies — The 1000x Steps

| Caching approach              | Latency   | Relative speed |
|-------------------------------|-----------|----------------|
| In-process variable (Go/Node) | ~100ns    | 1x             |
| Redis / Memcached (localhost) | ~0.1ms    | 1,000x slower  |
| DB query via API              | ~100ms    | 1,000,000x slower |

### When to Use Each
- **In-process**: single consumer, long-running process (Go, Node.js, or long-running PHP)
- **Redis**: multiple consumers need shared state
- **DB**: source of truth, eventual consistency target

### PHP and Long-Running Processes
- PHP's GC was designed for short-lived processes
- Risk of memory leaks in long-running PHP workers
- Workers often restart periodically — cache gets wiped
- Go/Node.js don't have this problem — designed for long-running processes
- Exception: bounded, fixed-size cache (e.g., 2000 device states) is safe even in PHP

---

## 5. Separating Fast Path from Slow Path

### The Problem (Generic IoT Example)
- Device sends telemetry message to a queue
- Consumer reads message, updates device state
- State update requires multiple DB reads and writes (~10+ calls, ~1 second total)

### The Solution: Redis + Write Queue
1. Read device state from Redis (~0.1ms)
2. Modify state in memory
3. Write new state to Redis (~0.1ms)
4. Publish result to "DB write" queue (~0.1ms)
5. Immediately process next message (~2ms total vs ~1 second)

### Separate DB Writer Consumer
- Reads from the DB write queue
- Batches writes for efficiency
- Database is eventually consistent with Redis

---

## 6. Fire-and-Forget vs Await — The Tradeoff

### The Core Tradeoff: Speed vs Consistency
- **Await DB write**: safe, but ~100ms blocking per write
- **Fire-and-forget**: fast, but if it fails — data lost, client doesn't know
- **Queue-based write**: fast AND reliable — RabbitMQ guarantees delivery

### Using Timestamps for Consistency
- Each message has a timestamp field
- DB writer can use: `UPDATE ... WHERE timestamp < ?`
- Out-of-order messages don't overwrite newer state
- Note: event-type data (status changes) cannot be dropped — needs sequential processing

---

## 7. Batching DB Writes

### The Pattern
```
lastFlush = now()

while (true) {
    message = consumer.wait(timeout: 100ms)

    if (message) {
        buffer.add(message)
    }

    if (buffer.notEmpty() && (now() - lastFlush >= 100ms)) {
        writeBatchToDB(buffer)
        ackAll(buffer)
        buffer.clear()
        lastFlush = now()
    }
}
```

### Key Design Decisions
- **Timer via consume timeout**: no separate process needed, the `wait(timeout)` acts as the timer
- **Time check on flush**: prevents flushing too often when messages arrive faster than the interval
- **Don't ACK until batch is written**: if process crashes, unacknowledged messages return to queue — nothing lost
- **Batch optimizations**: drop redundant writes (latest value wins), combine multiple devices in one query

### Result
- Reduces total DB load (fewer connections, fewer transactions, fewer locks)
- Turns N individual writes into a few batched queries
- Database is happier, consumers are faster

---

## 8. Fire-and-Forget Across Languages

### The Same Pattern, Different Syntax

| Language | How to fire-and-forget | Mechanism |
|---|---|---|
| **Node.js** | Remove `await` | Promise runs in background on the same event loop |
| **Go** | `go myFunction()` | Spawns a goroutine, runs concurrently |
| **PHP (HTTP/FPM)** | `fastcgi_finish_request()` | Sends response to client, then continues executing |
| **PHP (queue consumer)** | Not possible in-process | Must use a separate queue or process |

### Why PHP Queue Consumers Are Different
- Node.js and Go can both say "do this in the background" within the same process
- PHP's queue consumer is a single-threaded synchronous loop — there is no "background"
- Nothing else runs while the consumer waits for a DB write
- The separate DB write queue is not just an optimization — it's the **only way** to defer work

### Key Insight
- The execution model of the language determines which architectural patterns are available
- Go: concurrency is built into the language (goroutines)
- Node.js: concurrency via event loop and promises
- PHP: concurrency only via external infrastructure (queues, separate processes)

---

## Summary Slide

The performance journey:
```
DB read per message:     ~100ms   (starting point)
        ↓ add Redis cache
Redis read per message:  ~0.1ms   (1,000x improvement)
        ↓ add in-process cache (single consumer)
RAM read per message:    ~100ns   (1,000,000x improvement)
        ↓ separate DB writes to queue + batching
DB write load:           reduced by 10-100x
```

Core principle: **identify where your code is waiting, and eliminate or defer that wait.**
