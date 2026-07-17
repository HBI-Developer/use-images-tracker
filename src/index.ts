import { useEffect, useRef, useState } from "react";

export default function useImagesTracker() {
  const tracker = useRef<HTMLElement>(null),
    [isStarted, setIsStarted] = useState(false),
    isFirstTime = useRef(true),
    images = useRef<HTMLImageElement[]>([]),
    [failures, setFailures] = useState<
      Array<{ code: number; image: HTMLImageElement; url: string }>
    >([]),
    [counter, setCounter] = useState(0),
    [isLoaded, setIsLoaded] = useState(false),
    imageListeners = useRef<Map<HTMLImageElement, { load: () => void; error: () => void }>>(new Map()),
    removeListeners = () => {
      imageListeners.current.forEach(({ load, error }, img) => {
        img.removeEventListener("load", load);
        img.removeEventListener("error", error);
      });
      imageListeners.current.clear();
    },
    tracking = () => {
      if (isStarted) return;
      removeListeners();
      setIsStarted(true);
      images.current = Array.from(tracker.current?.querySelectorAll("img") ?? []);

      if (images.current.length === 0) {
        setIsLoaded(true);
        return;
      }

      const increaseCounter = () => {
        setCounter((prev: number) => prev + 1);
      };

      images.current.forEach((image: HTMLImageElement) => {
        if (image.complete) increaseCounter();
        else {
          const onError = async () => {
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
          };
          image.addEventListener("load", increaseCounter);
          image.addEventListener("error", onError);
          imageListeners.current.set(image, { load: increaseCounter, error: onError });
        }
      });
    },
    repeating = () => {
      if (!isStarted || isFirstTime.current) return;
      removeListeners();
      setCounter(0);
      setIsLoaded(false);
      setFailures([]);
      setTimeout(() => {
        setIsStarted(false);
      }, 0);
    };

  useEffect(() => {
    tracking();
    return () => removeListeners();
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
