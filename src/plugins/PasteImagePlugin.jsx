import { useEffect } from "react";
import { TextNode } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

function usePaste(editor) {
  useEffect(() => {
    
    
    return () => {
    
    };
  }, [editor]);
}

export default function PasteImagePlugin() {
  const [editor] = useLexicalComposerContext();
  usePaste(editor);
  return null;
}
