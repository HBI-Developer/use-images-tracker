import { useEffect, useRef, useState } from "react";

export default function useImagesTracker() {
  const tracker = useRef<any>(null),
    isStarted = useRef(false),
    images = useRef<Array<HTMLImageElement>>([]),
    [failures, setFailures] = useState<
      Array<{ code: number; image: HTMLImageElement; url: string }>
    >([]),
    [counter, setCounter] = useState(0),
    [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isStarted.current) return;
    isStarted.current = true;
    images.current = tracker.current?.querySelectorAll("img") || [];

    const increaseCounter = () => {
      setCounter((prev) => prev + 1);
    };

    [].forEach.call(images.current, (image: HTMLImageElement) => {
      if (image.complete) increaseCounter();
      else {
        image.addEventListener("load", increaseCounter);
        image.addEventListener("error", async () => {
          const error = { image, code: 0, url: image.src };
          increaseCounter();
          try {
            const url = await fetch(image.src);

            if (!url.ok) {
              error.code = url.status;
            }
          } catch (_) {
            error.code = 500;
          }

          setFailures((prev) => [...prev, error]);
        });
      }
    });
  }, []);

  useEffect(() => {
    if (counter === images.current.length) setIsLoaded(true);
  }, [counter]);

  return { tracker, isLoaded, failures };
}
