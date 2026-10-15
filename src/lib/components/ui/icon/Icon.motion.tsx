/*
SVG geometry adapted from Tabler Icons.
MIT License

Copyright (c) 2020-2026 Paweł Kuna

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import type { CSSProperties, ReactNode } from "react";
import { ACCOUNT_HEXAGON, ACCOUNT_PENTAGON, ACCOUNT_SQUARE, FOLDER_CLOSED, FOLDER_OPEN } from "./Icon.motion.paths";

export default function MotionIcon({
  motion,
  size,
  color,
  strokeWidth,
  className,
  children,
}: {
  motion: "folder" | "account";
  size: number;
  color: string;
  strokeWidth: number;
  className?: string;
  children?: ReactNode;
}) {
  const folder = motion === "folder";
  const shapes = folder
    ? { "--icon-folder-closed": `path("${FOLDER_CLOSED}")`, "--icon-folder-open": `path("${FOLDER_OPEN}")` }
    : {
        "--icon-account-square": `path("${ACCOUNT_SQUARE}")`,
        "--icon-account-hexagon": `path("${ACCOUNT_HEXAGON}")`,
        "--icon-account-pentagon": `path("${ACCOUNT_PENTAGON}")`,
      };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={shapes as CSSProperties}
      className={`tabler-icon icon-motion ${folder ? "icon-motion-folder" : "icon-motion-account"} ${className ?? ""}`}>
      {children}
      {folder ? (
        <path d="M3 17V6a2 2 0 0 1 2-2h4l3 3h7a2 2 0 0 1 2 2v2" />
      ) : (
        <>
          <path d="M12 13a3 3 0 1 0 0-6a3 3 0 0 0 0 6" />
          <path d="M7 18.7a4 4 0 0 1 3-2.7h4a4 4 0 0 1 3 2.7" />
        </>
      )}
      <path className="icon-contour" d={folder ? FOLDER_CLOSED : ACCOUNT_SQUARE} />
    </svg>
  );
}
