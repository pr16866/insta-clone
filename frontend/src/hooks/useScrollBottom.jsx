import { useEffect, useRef } from "react";

const useScrollToBottom = (dependencyList = []) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, dependencyList); // Trigger scrolling when dependencies change

  return containerRef;
};

export default useScrollToBottom;
