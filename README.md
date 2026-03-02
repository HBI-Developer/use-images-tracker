# use-images-tracker

React Hook to check whether images inside a tracked element/component are loaded.

Features

- Lightweight React hook that tracks images inside a container and reports load/failure state.

Install

```bash
npm install use-images-tracker
```

Peer dependencies

- This package requires React (>=16.8.0).

Usage

```tsx
import React from "react";
import useImagesTracker from "use-images-tracker";

function Example() {
  const { tracker, isLoaded, failures, repeating } = useImagesTracker();

  return (
    <div>
      <div ref={tracker}>
        <img src="/path/to/image1.jpg" alt="img1" />
        <img src="/path/to/image2.jpg" alt="img2" />
      </div>

      {isLoaded ? <p>All images loaded</p> : <p>Loading images…</p>}

      {failures.length > 0 && (
        <ul>
          {failures.map((f, i) => (
            <li key={i}>
              {f.url} — code: {f.code}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Example;
```

API

- `tracker`: React ref to attach to the container element that holds images.
- `isLoaded`: boolean, becomes `true` when all tracked images are finished (loaded or errored).
- `failures`: array of failure records `{ code, image, url }` for images that errored.
- `repeating`: function to restart tracking (useful when images change dynamically).

Build from source

```bash
npm install
npm run build
```

Publish

```bash
npm publish --access public
```

License

This project is licensed under the MIT License
