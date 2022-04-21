import LexicalComposer from '@lexical/react/LexicalComposer';
import PlainTextPlugin from '@lexical/react/LexicalPlainTextPlugin';
import ContentEditable from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import OnChangePlugin from '@lexical/react/LexicalOnChangePlugin';
import TreeViewPlugin from './plugins/TreeViewPlugin';

import MyCustomAutoFocusPlugin from './plugins/MyCustomAutoFocusPlugin';
import editorConfig from './editorConfig';
import onChange from './onChange';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createParagraphNode,
  $createTextNode,
  $getSelection,
  $createRangeSelection,
  $setSelection,
  $createNodeSelection,
  RangeSelection,
  _Point, $getNodeByKey,
} from 'lexical';
import { $moveCaretSelection, $selectAll } from '@lexical/selection';

import React from 'react';


export default function Editor() {
  return (<LexicalComposer initialConfig={editorConfig}>
    <PlainTextEditor/>
  </LexicalComposer>);
}

function Placeholder() {
  return <div className="editor-placeholder">Enter some plain text...</div>;
}

function PlainTextEditor() {
  const [editor] = useLexicalComposerContext();

  const onPaste = ev => {
    const { files } = ev.clipboardData;
    if (files.length === 0) {
      return;
    }

    console.log(files);
    [...files].forEach(i => {
      if (i.type.startsWith(`image/`)) {
        setTimeout(() => {
          insetMediaLink(i.name);
        }, 1000);
      }
      if (i.type.startsWith(`video/`)) {
        setTimeout(() => {
          insetMediaLink(i.name);
        }, 1000);
      }
    });
  };

  const insetMediaLink = (name) => {
    editor.update(() => {
      const selection = $getSelection();
      const textNode = $createTextNode(`![${name}](https://xxx.xx/meida/aa/${name})`);
      selection.insertNodes([textNode]);
    });
  };

  const applyH1 = () => {
    editor.update(() => {
      const selection = $getSelection();
      const marker = $createTextNode(`# `);
      let [p] = selection.getNodes();

      if (!p) {
        selection.insertNodes([marker]);
        return;
      }
      if (p.getType() === 'linebreak') {
        selection.insertNodes([marker]);
        return;
      }
      p?.insertBefore(marker);
    });
  };

  const applyToSelection = (marker) => () => {
    editor.update(() => {
      let selection = $getSelection();
      const { anchor, focus } = selection;
      const anchorOffset = anchor.offset;
      const focusOffset = focus.offset;

      const anchorNode = $getNodeByKey(anchor.key);
      const focusNode = $getNodeByKey(focus.key);
      const text = `${marker}${selection.getTextContent()}${marker}`;
      selection.insertRawText(text);
      selection.setTextNodeRange(anchorNode, anchorOffset + 2, focusNode, focusOffset + 2);
    });
  };

  return (
    <div>
      <div className={`toolbar`}>
        <button onClick={applyH1}>H1</button>
        <button onClick={applyToSelection(`**`)}>B</button>
      </div>
      <div className="editor-container" onPaste={onPaste}>
        <PlainTextPlugin
          contentEditable={<ContentEditable className="editor-input"/>}
          placeholder={<Placeholder/>}
        />
        <OnChangePlugin onChange={onChange}/>
        <HistoryPlugin/>
        <TreeViewPlugin/>
        <MyCustomAutoFocusPlugin/>
      </div>
    </div>
  );
}
