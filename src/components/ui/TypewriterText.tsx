import { useEffect, useState } from "react";

interface TypewriterTextProps {
  lines: string[];
  speed?: number;
  lineDelay?: number;
  className?: string;
  cursorColor?: string;
}

export function TypewriterText({
  lines,
  speed = 55,
  lineDelay = 400,
  className = "",
  cursorColor = "var(--primary)",
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed(lines.map(() => ""));
    setCurrentLine(0);
    setCurrentChar(0);
    setDone(false);
  }, [lines.join("|")]);

  useEffect(() => {
    if (currentLine >= lines.length) {
      setDone(true);
      return;
    }
    const line = lines[currentLine];
    if (currentChar >= line.length) {
      const timeout = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }, lineDelay);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => {
      setDisplayed((prev) => {
        const next = [...prev];
        next[currentLine] = line.slice(0, currentChar + 1);
        return next;
      });
      setCurrentChar((c) => c + 1);
    }, speed);
    return () => clearTimeout(timeout);
  }, [currentLine, currentChar, lines, speed, lineDelay]);

  return (
    <span>
      {lines.map((line, i) => (
        <span key={i} className={`block ${className}`}>
          {displayed[i]}
          {i === currentLine && !done && (
            <span
              className="inline-block w-[3px] h-[0.9em] ml-1 align-middle animate-cursor-blink"
              style={{ backgroundColor: cursorColor }}
            />
          )}
          {i < currentLine && <span className="inline-block w-[3px] h-[0.9em] ml-1 align-middle opacity-0" />}
        </span>
      ))}
    </span>
  );
}
