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
      let { anchor, focus } = sel;
      let anchorOffset = anchor.offset;
      let focusOffset = focus.offset;
      let anchorNode = $getNodeByKey(anchor.key);
      let focusNode = $getNodeByKey(focus.key);

      if (hasNoSelection(sel)) {
        sel.insertRawText(`${prefix}${suffix}`);
        sel = $getSelection();
        focusNode = $getNodeByKey(sel.focus.key);
        focusOffset = sel.focus.offset;
        sel.setTextNodeRange(focusNode, focusOffset - suffix.length, focusNode, focusOffset - suffix.length);
        return;
      }

      let text = `${prefix}${sel.getTextContent()}${suffix}`;
      sel.insertNodes([$createTextNode(text)]);
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
      const { offset } = sel.focus;
      const node = $getNodeByKey(sel.focus.key);
      sel.setTextNodeRange(node, offset - 4, node, offset - 1);
    });
  };

  const addQuote = () => {
    editor.update(() => {
      const sel = $getSelection();
      const nodes = sel.getNodes();

      if (nodes.length === 0) {
        sel.insertNodes([$createTextNode(`> `)]);
        return;
      }

      nodes.forEach(n => {
        n.insertBefore($createTextNode(`> `));
      });
      // todo! focus
    });
  };

  const addCode = () => {
    editor.update(() => {
      let sel = $getSelection();
      let { anchor, focus } = sel;
      let anchorOffset = anchor.offset;
      let anchorNode = $getNodeByKey(anchor.key);
      let focusOffset = focus.offset;
      let focusNode = $getNodeByKey(focus.key);

      const nodes = sel.getNodes();
      if (nodes.length === 0) {
        sel.insertNodes([$createTextNode('``')]);
        let focusNode = $getNodeByKey(sel.focus.key);
        let offset = sel.focus.offset;
        sel.setTextNodeRange(focusNode, offset - 1, focusNode, offset - 1);
        return;
      }

      const hasLineBreak = nodes.some(n => n.getType() === 'linebreak');
      const text = sel.getTextContent();
      if (hasLineBreak) {
        const newText = `\n\`\`\`\n${text}\n\`\`\`\n`;
        sel.insertRawText(newText);
        sel = $getSelection();
        const node = $getNodeByKey(sel.focus.key);
      } else {
        sel.insertRawText(`\`${text}\``);
        sel.setTextNodeRange(anchorNode, anchorOffset + 1, focusNode, focusOffset + 1);
      }
    });
  };

  const toList = (prefix = ``) => () => {
    editor.update(() => {
      let sel = $getSelection();
      const nodes = sel.getNodes();

      if (nodes.length === 0) {
        sel.insertNodes([$createTextNode(`${prefix.length > 0 ? prefix : '1.'} `)]);
        return;
      }
      if (nodes.length === 1) {
        let node = nodes[0];
        let n = node.insertBefore($createTextNode(`${prefix.length > 0 ? prefix : '1.'} `));
        let offset = n.getTextContentSize();
        sel.setTextNodeRange(n, offset, n, offset);
        return;
      }

      const markedNodes = nodes
        .filter((n, idx) => {
          const type = n.getType();
          return type !== `linebreak` || (type === `linebreak` && nodes[idx - 1]?.getType() === `linebreak`);
        });
      markedNodes.forEach((n, idx) => {
        let t = prefix ? `${prefix} ` : `${idx + 1}. `;
        n.insertBefore($createTextNode(t));
      });

      let lastNode = nodes[nodes.length - 1];
      let offset = lastNode.getTextContentSize();
      sel.setTextNodeRange(lastNode, offset, lastNode, offset);
    });
  };

  const hasNoSelection = (sel) => {
    const { anchor, focus} = sel;
    return anchor.key === focus.key && anchor.offset === focus.offset;
  };

  const insertTable = () => {
    editor.update(() => {
      let sel = $getSelection();
      const nodes = sel.getNodes();
      const tNode = $createTextNode(`| header | header |
| ------ | ------ |
| cell | cell |
| cell | cell |`);
      if (nodes.length === 0) {
        sel.insertNodes([tNode]);
        return;
      }

      let node = nodes[nodes.length - 1].insertAfter($createLineBreakNode()).insertAfter(tNode);
      sel.setTextNodeRange(node, 0, node, 0);
    });
  };

  return (
    <div>
      <div className={`toolbar`}>
        <div>
          <button onClick={applyH1}>H1</button>
          <button onClick={applyToSelection(`**`, `**`)}>B</button>
          <button onClick={applyToSelection(`*`, `*`)}><em>I</em></button>
          <button onClick={addLink}>Link</button>
          <button onClick={addCode}>{`</>`}</button>
          <button onClick={insertTable}>Table</button>
        </div>

        <div>
          <button onClick={toList(`>`)}>{`>`}</button>
          <button onClick={toList(`-`)}>Bullet List</button>
          <button onClick={toList(``)}>Ordered List</button>
          <button onClick={toList(`- [ ]`)}>Task List</button>
        </div>
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
