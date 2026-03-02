import { useEffect, useRef, useState } from "react";

export default function useImagesTracker() {
  const tracker = useRef<any>(null),
    [isStarted, setIsStarted] = useState(false),
    isFirstTime = useRef(true),
    images = useRef<Array<HTMLImageElement>>([]),
    [failures, setFailures] = useState<
      Array<{ code: number; image: HTMLImageElement; url: string }>
    >([]),
    [counter, setCounter] = useState(0),
    [isLoaded, setIsLoaded] = useState(false),
    tracking = () => {
      if (isStarted) return;
      setIsStarted(true);
      images.current = tracker.current?.querySelectorAll("img") || [];

      if (images.current.length === 0) {
        setIsLoaded(true);
        return;
      }

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
    },
    repeating = () => {
      if (!isStarted || isFirstTime.current) return;
      setCounter(0);
      setIsLoaded(false);
      setTimeout(() => {
        setIsStarted(false);
      }, 0);
    };

  useEffect(() => {
    tracking();
  }, []);

  useEffect(() => {
    if (!isStarted) tracking();
  }, [isStarted]);

  useEffect(() => {
    if (counter >= images.current.length) {
      setIsLoaded(true);
      isFirstTime.current = false;
    }
  }, [counter]);

  return { tracker, isLoaded, failures, repeating };
}
