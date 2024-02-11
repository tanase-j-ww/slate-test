"use client";

import { useState } from "react";
import { createEditor } from "slate";
import { Editable, Slate, withReact } from "slate-react";

// TypeScript users only add this code
import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";

type CustomElement = { type: "paragraph"; children: CustomText[] };
type CustomText = { text: string };

declare module "slate" {
  interface CustomType {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  },
  {
    type: "headers",
    children: [{ text: "line" }],
  },
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  },
];

export default function Home() {
  const [editor] = useState(() => withReact(createEditor()));
  return (
    <Slate editor={editor} initialValue={initialValue}>
      <Editable
        onKeyDown={(event) => {
          if (event.key === "&") {
            // Prevent the ampersand character from being inserted.
            event.preventDefault();
            // Execute the `insertText` method when the event occurs.
            editor.insertText("and");
          }
        }}
      />
    </Slate>
  );
}
