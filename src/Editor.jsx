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
  $getNodeByKey, $createLineBreakNode,
} from 'lexical';

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
      const sel = $getSelection();
      const textNode = $createTextNode(`![${name}](https://xxx.xx/meida/aa/${name})`);
      sel.insertNodes([textNode]);
    });
  };

  const applyH1 = () => {
    editor.update(() => {
      const sel = $getSelection();
      const marker = $createTextNode(`# `);
      let [p] = sel.getNodes();

      if (!p) {
        sel.insertNodes([marker]);
        return;
      }
      if (p.getType() === 'linebreak') {
        sel.insertNodes([marker]);
        return;
      }
      p?.insertBefore(marker);
    });
  };

  const applyToSelection = (prefix = ``, suffix = ``) => () => {
    editor.update(() => {
      let sel = $getSelection();
      const { anchor, focus } = sel;
      const anchorOffset = anchor.offset;
      const focusOffset = focus.offset;

      const anchorNode = $getNodeByKey(anchor.key);
      const focusNode = $getNodeByKey(focus.key);
      const text = `${prefix}${sel.getTextContent()}${suffix}`;
      sel.insertRawText(text);

      sel.setTextNodeRange(anchorNode, anchorOffset + prefix.length, focusNode, focusOffset + suffix.length);
    });
  };

  const addLink = () => {
    editor.update(() => {
      let sel = $getSelection();
      const selectedText = sel.getTextContent();
      const newText = `[${selectedText}](url)`;
      sel.insertRawText(newText);

      sel = $getSelection();
      const { offset } = sel.focus
      const node = $getNodeByKey(sel.focus.key);
      sel.setTextNodeRange(node, offset - 4, node, offset - 1);
    });
  };

  const addQuote = () => {
    editor.update(() => {
      const sel = $getSelection();
      const nodes = sel.getNodes();
      nodes.forEach(n => {
        n.insertBefore($createTextNode(`> `));
      });
      // todo! focus
    });
  };

  const addCode = () => {
    editor.update(() => {
      const sel = $getSelection();
      let { anchor, focus } = sel;
      const anchorOffset = anchor.offset;
      const anchorNode = $getNodeByKey(anchor.key);
      const anchorKey = anchorNode.getKey();
      const focusOffset = focus.offset;
      const focusNode = $getNodeByKey(focus.key);
      const focusKey = focusNode.getKey();

      const nodes = sel.getNodes();
      const hasLineBreak = nodes.some(n => n.getType() === 'linebreak');

      const text = sel.getTextContent();
      if (hasLineBreak) {
        const newText = `\n\`\`\`\n${text}\n\`\`\`\n`;
        sel.insertRawText(newText);
        // todo! focus
      } else {
        sel.insertRawText(`\`${text}\``);
        sel.setTextNodeRange(anchorNode, anchorOffset + 1, focusNode, focusOffset + 1);
      }
    });
  };

  return (
    <div>
      <div className={`toolbar`}>
        <button onClick={applyH1}>H1</button>
        <button onClick={applyToSelection(`**`, `**`)}>B</button>
        <button onClick={applyToSelection(`*`, `*`)}>U</button>
        <button onClick={addLink}>Link</button>
        <button onClick={addQuote}>{`>`}</button>
        <button onClick={addCode}>{`</>`}</button>
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
