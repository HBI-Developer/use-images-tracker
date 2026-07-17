# use-images-tracker

### A lightweight React Hook to track image load state inside any container

Know exactly when every `<img>` inside a tracked element has finished loading — or failed — without wiring manual `onLoad` / `onError` handlers on each image.

Built for developers who need reliable image-load orchestration in galleries, product grids, lazy layouts, and dynamic content without reinventing DOM event plumbing.

[![npm version](https://img.shields.io/npm/v/use-images-tracker?style=for-the-badge&logo=npm&logoColor=fff)](https://www.npmjs.com/package/use-images-tracker)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-%3E%3D16.8-61DAFB?style=for-the-badge&logo=react&logoColor=fff)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![Package](https://img.shields.io/badge/Package-NPM-red?style=for-the-badge)](https://www.npmjs.com/package/use-images-tracker)

![React](https://img.shields.io/badge/Library-React-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript)
![DOM](https://img.shields.io/badge/API-DOM%20Events-orange?style=flat-square)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-blue?style=flat-square)

[Install](#installation) · [Quick Start](#quick-start) · [API Reference](#api-reference) · [Report Bug](https://github.com/HBI-Developer/use-images-tracker/issues)

---

## Table of Contents

- [Overview](#overview)
- [Why This Hook](#why-this-hook)
- [Core Features](#core-features)
- [How It Works](#how-it-works)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## Overview

**use-images-tracker** is a zero-dependency React Hook that attaches to a container element and automatically monitors every `<img>` descendant inside it.

Attach a ref, render your images, and read a single `isLoaded` boolean when the batch is complete. Failed images are collected with HTTP status codes so you can surface meaningful error UI.

The hook is intentionally small, readable, and performance-conscious — one query, native browser events, no polling.

---

## Why This Hook

Tracking image load state manually in React usually means:

- Adding `onLoad` / `onError` to every `<img>`
- Maintaining a counter or Set in component state
- Re-running logic when images change dynamically
- Handling already-cached images that fire before listeners attach

`useImagesTracker` centralizes that logic into one hook call.

You focus on UI. The hook handles DOM discovery, event binding, cached-image detection, and failure reporting.

---

## Core Features

### Container-Scoped Tracking

Attach `tracker` to any element. All nested `<img>` tags are discovered automatically via `querySelectorAll`.

### Cached Image Support

Images already in the browser cache (`image.complete === true`) are counted immediately — no missed load events.

### Failure Reporting

When an image fails, the hook records `{ code, image, url }` and attempts to resolve the HTTP status via `fetch`.

### Dynamic Re-Tracking

Call `repeating()` to reset and re-scan the container when images are added, removed, or their `src` changes.

### Zero Runtime Dependencies

Only `react` is required as a peer dependency. No extra bundle weight.

---

## How It Works

```
Component Mount
      ↓
Attach tracker ref to container
      ↓
querySelectorAll("img")
      ↓
For each image:
  ├── complete?  → increment counter
  └── pending?   → listen for load / error
      ↓
counter >= total images
      ↓
isLoaded = true
```

---

## Installation

Using npm:

```bash
npm install use-images-tracker
```

Using yarn:

```bash
yarn add use-images-tracker
```

Using pnpm:

```bash
pnpm add use-images-tracker
```

**Peer dependency:** React `>=16.8.0` (Hooks support required).

---

## Quick Start

```tsx
import useImagesTracker from "use-images-tracker";

function Gallery() {
  const { tracker, isLoaded, failures } = useImagesTracker();

  return (
    <div>
      <div ref={tracker}>
        <img src="/photo-1.jpg" alt="Photo 1" />
        <img src="/photo-2.jpg" alt="Photo 2" />
        <img src="/photo-3.jpg" alt="Photo 3" />
      </div>

      {isLoaded ? (
        <p>All images ready.</p>
      ) : (
        <p>Loading images…</p>
      )}
    </div>
  );
}
```

---

## API Reference

The hook returns an object with four members:

| Member       | Type                                                                 | Description |
| ------------ | -------------------------------------------------------------------- | ----------- |
| `tracker`    | `React.MutableRefObject<any>`                                        | Ref to attach to the container element that wraps your images. |
| `isLoaded`   | `boolean`                                                            | `true` when every tracked image has finished (loaded or errored). `true` immediately if no images are found. |
| `failures`   | `Array<{ code: number; image: HTMLImageElement; url: string }>`      | Accumulated failure records for images that errored during tracking. |
| `repeating`  | `() => void`                                                         | Resets tracking state and re-scans the container. Clears `failures`, counter, and `isLoaded`. No-op on first render or before tracking starts. Use when images change dynamically. |

### Failure Object

| Field   | Type                  | Description |
| ------- | --------------------- | ----------- |
| `code`  | `number`              | HTTP status from a follow-up `fetch`, or `500` on network failure, or `0` if unresolved. |
| `image` | `HTMLImageElement`    | Reference to the DOM image element that failed. |
| `url`   | `string`              | The `src` of the failed image. |

---

## Examples

### Basic Loading Indicator

```tsx
import useImagesTracker from "use-images-tracker";

function ProductGrid({ urls }: { urls: string[] }) {
  const { tracker, isLoaded } = useImagesTracker();

  return (
    <>
      {!isLoaded && <div className="spinner" aria-busy="true" />}

      <div ref={tracker} className={isLoaded ? "visible" : "hidden"}>
        {urls.map((url) => (
          <img key={url} src={url} alt="" />
        ))}
      </div>
    </>
  );
}
```

### Error Handling

```tsx
import useImagesTracker from "use-images-tracker";

function GalleryWithErrors() {
  const { tracker, isLoaded, failures } = useImagesTracker();

  return (
    <div>
      <div ref={tracker}>
        <img src="/valid.jpg" alt="Valid" />
        <img src="/broken.jpg" alt="Broken" />
      </div>

      {isLoaded && failures.length > 0 && (
        <ul>
          {failures.map((f, i) => (
            <li key={i}>
              Failed: {f.url} (HTTP {f.code || "unknown"})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Dynamic Images (Re-Tracking)

When images are swapped or added after the initial render, call `repeating()` to restart tracking:

```tsx
import { useEffect } from "react";
import useImagesTracker from "use-images-tracker";

function DynamicGallery({ urls }: { urls: string[] }) {
  const { tracker, isLoaded, repeating } = useImagesTracker();

  useEffect(() => {
    repeating();
  }, [urls]);

  return (
    <div ref={tracker}>
      {urls.map((url) => (
        <img key={url} src={url} alt="" />
      ))}
      {!isLoaded && <span>Loading…</span>}
    </div>
  );
}
```

---

## Development

Clone the repository:

```bash
git clone https://github.com/HBI-Developer/use-images-tracker.git
cd use-images-tracker
```

Install dependencies and build:

```bash
npm install
npm run build
```

The compiled output is written to `dist/`.

### Project Structure

```
use-images-tracker/
├── src/
│   └── index.ts       # Hook implementation
├── dist/              # Compiled output (published to npm)
├── package.json
├── tsconfig.json
└── LICENSE
```

---

## Contributing

Contributions are welcome.

You can help by:

- Reporting bugs
- Suggesting features
- Improving documentation
- Submitting pull requests

### Workflow

```bash
git checkout -b feature/your-feature
# make changes
npm run build
git commit -m "feat: describe your change"
git push origin feature/your-feature
```

Then open a Pull Request on GitHub.

---

## License

This project is licensed under the [MIT License](LICENSE).

You are free to use, modify, and distribute this software commercially.

---

## Support

- [Open an issue](https://github.com/HBI-Developer/use-images-tracker/issues) for bugs or feature requests
- [View on npm](https://www.npmjs.com/package/use-images-tracker)
- [View source on GitHub](https://github.com/HBI-Developer/use-images-tracker)

---

### Reliable image load tracking for React — one hook, zero boilerplate.
