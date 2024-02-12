"use client";

import { useCallback, useState } from "react";
import { Descendant, Editor, Transforms, createEditor } from "slate";
import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  withReact,
} from "slate-react";

// TypeScript users only add this code
import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";

interface CustomReactEditor extends BaseEditor, ReactEditor {
  type: "paragraph" | "heading" | "code" | null | undefined;
}

export type CustomEditor = BaseEditor & ReactEditor & CustomReactEditor;

export type ParagraphElement = {
  type: "paragraph";
  children: CustomText[];
};

export type HeadingElement = {
  type: "heading";
  level: number;
  children: CustomText[];
};

export type CodeElement = {
  type: "code" | null | undefined;
  children: CustomText[];
};

export type CustomElement = ParagraphElement | HeadingElement | CodeElement;

export type FormattedText = {
  text: string;
  bold?: true;
  color?: { color?: string; isActive: boolean };
  // color?: string;
  type?: "paragraph" | "code" | "heading";
  children?: CustomText[];
};

export type CustomText = FormattedText;

declare module "slate" {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  },
];
const Home = () => {
  const [editor] = useState(() => withReact(createEditor()));
  const [color, setColor] = useState<string>("#ffffff");

  const renderElement = useCallback((props: RenderElementProps) => {
    switch (props.element.type) {
      case "code":
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />;
  }, []);

  return (
    // Add a toolbar with buttons that call the same methods.
    <Slate editor={editor} initialValue={initialValue}>
      <div>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleBoldMark(editor);
          }}
        >
          Bold
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleCodeBlock(editor);
          }}
        >
          Code Block
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleColorMark(editor, color);
          }}
        >
          Color
        </button>
        <input
          type="color"
          name="color"
          id="color"
          onChange={(event) => {
            event.preventDefault();
            const value = event.currentTarget.value;
            if (value) CustomEditor.setColorValue(editor, value);
            setColor(value);
          }}
        />
      </div>
      <Editable
        editor={editor}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={(event) => {
          if (!event.ctrlKey) {
            return;
          }

          switch (event.key) {
            case "`": {
              event.preventDefault();
              CustomEditor.toggleCodeBlock(editor);
              break;
            }

            case "b": {
              event.preventDefault();
              CustomEditor.toggleBoldMark(editor);
              break;
            }
          }
        }}
      />
    </Slate>
  );
};
export default Home;

const CodeElement = (props: RenderElementProps) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};

const DefaultElement = (props: RenderElementProps) => {
  return <p {...props.attributes}>{props.children}</p>;
};

// Define a React component to render leaves with bold text.
const Leaf = (props: RenderLeafProps) => {
  return (
    <span
      {...props.attributes}
      style={{
        fontWeight: props.leaf.bold ? "bold" : "normal",
        color: props.leaf.color?.isActive ? props.leaf.color.color : "",
      }}
    >
      {props.children}
    </span>
  );
};

// Define our own custom set of helpers.
const CustomEditor = {
  isBoldMarkActive(editor: CustomEditor) {
    const marks = Editor.marks(editor);
    return marks ? marks.bold === true : false;
  },

  isColorMarkActive(editor: CustomEditor) {
    const marks = Editor.marks(editor);
    return marks?.color?.isActive;
  },
  getCurrentColorValue(editor: CustomEditor) {
    const marks = Editor.marks(editor);
    console.log(marks, marks?.color);
    return marks?.color?.color;
  },

  isCodeBlockActive(editor: CustomEditor) {
    const match = Editor.nodes(editor, {
      match: (n) => n.type === "code",
    });
    return !!match;
  },

  toggleBoldMark(editor: CustomEditor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    if (isActive) {
      Editor.removeMark(editor, "bold");
    } else {
      Editor.addMark(editor, "bold", true);
    }
  },

  toggleColorMark(editor: CustomEditor, color: string) {
    const isActive = CustomEditor.isColorMarkActive(editor);
    if (isActive) {
      Editor.addMark(editor, "color", {
        isActive: !isActive,
        color: color,
      });
    } else {
      Editor.addMark(editor, "color", {
        isActive: !isActive,
        color: color,
      });
    }
  },
  setColorValue(editor: CustomEditor, value: string) {
    Editor.addMark(editor, "color", {
      isActive: true,
      color: value,
    });
  },

  toggleCodeBlock(editor: CustomEditor) {
    const isActive = CustomEditor.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? null : "code" },
      {
        match: (n) => n.type === "code",
        // Editor.isBlock(editor, n)
      }
    );
  },
};
