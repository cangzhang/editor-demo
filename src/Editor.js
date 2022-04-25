import LexicalComposer from '@lexical/react/LexicalComposer';
import PlainTextPlugin from '@lexical/react/LexicalPlainTextPlugin';
import ContentEditable from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import OnChangePlugin from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createTextNode, $getSelection, $getNodeByKey, $createLineBreakNode, UNDO_COMMAND,
} from 'lexical';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import TreeViewPlugin from './plugins/TreeViewPlugin';
import editorConfig from './editorConfig';
import onChange from './onChange';
import { SuggestionList } from './SuggestionList.js';

export function Editor() {
  return (<LexicalComposer initialConfig={editorConfig}>
    <PlainTextEditor/>
  </LexicalComposer>);
}

function Placeholder() {
  return <div className="editor-placeholder">Enter some plain text...</div>;
}

function PlainTextEditor() {
  const [editor] = useLexicalComposerContext();
  const suggestionListRef = useRef(null);
  const editorRef = useRef(null);

  const [showSuggestionMenu, toggleSuggestionMenu] = useState(false);
  const [queryParams, setQueryParams] = useState([]);
  const [caretRect, setCaretRect] = useState(null);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [curSuggestion, setCurSuggestion] = useState(``);

  useEffect(() => {
    let removeListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        let sel = $getSelection();
        if (!sel?.focus) {
          toggleSuggestionMenu(false);
          return;
        }

        let node = $getNodeByKey(sel.focus.key);
        let content = node.getTextContent();
        let offset = sel.focus.offset;
        let scope = ``;
        let query = ``;
        let char = ``;
        while (offset >= 0) {
          char = content.charAt(offset - 1);
          if (char === ` `) {
            break;
          }
          if (char === `@` || char === `#`) {
            toggleSuggestionMenu(true);

            query = content.substring(offset, sel.focus.offset);
            let o = offset;
            while (o >= 0) {
              let start = content.charAt(o);
              if (start === ` `) {
                // todo! multiple #/@
                scope = content.substring(o + 1, offset - 1);
                break;
              }

              scope = content.substring(o, offset - 1);
              o--;
            }
            break;
          }
          offset -= 1;
        }

        handleSuggestion(char, scope, query);
      });
    });

    return () => {
      removeListener();
    };
  }, [editor, showSuggestionMenu]);

  useEffect(() => {
    editorRef.current?.addEventListener('keydown', onKeyDown, true);

    return () => {
      editorRef.current?.removeEventListener(`keydown`, onKeyDown, true);
    };
  }, [showSuggestionMenu, queryParams]);

  const onResetActive = (idx) => {
    setActiveSuggestion(idx);
  };

  const onActiveSuggestionChanged = (val) => {
    setCurSuggestion(val);
  };

  const handleSuggestion = useCallback((tag, scope, query) => {
    if (tag !== `@` && tag !== `#`) {
      toggleSuggestionMenu(false);
      return;
    }

    toggleSuggestionMenu(true);
    setQueryParams([tag, scope, query]);
    onCaretChange();
  }, [showSuggestionMenu]);

  const applySuggestion = useCallback(([tag, _scope, query], val) => {
    editor.update(() => {
      let sel = $getSelection();
      let node = $getNodeByKey(sel.focus.key);
      let content = node.getTextContent();
      let index = content.lastIndexOf(tag + query);
      content = content.substring(0, index) + `${tag}${val} `;
      node = node.replace($createTextNode(content));
      sel.setTextNodeRange(node, node.getTextContentSize(), node, node.getTextContentSize());
      toggleSuggestionMenu(false);
    });
  }, [editor]);

  const moveSuggestionUp = () => {
    setActiveSuggestion(i => i - 1);
  };

  const moveSuggestionDown = () => {
    setActiveSuggestion(i => i + 1);
  };

  const onCaretChange = () => {
    let selection = window.getSelection();
    let range = selection.getRangeAt(0);
    let rect = range.getClientRects()[0];
    setCaretRect(rect);
  };

  const onKeyDown = useCallback(ev => {
    if (ev.key === `Enter`) {
      if (showSuggestionMenu) {
        ev.preventDefault();
        ev.stopPropagation();
        console.log(curSuggestion);
        applySuggestion(queryParams, curSuggestion);
      }
    }

    if (ev.key === `Escape`) {
      toggleSuggestionMenu(false);
    }

    if (ev.key === `ArrowDown` || ev.key === `ArrowUp`) {
      if (showSuggestionMenu) {
        ev.preventDefault();
        ev.stopPropagation();
        switch (ev.key) {
          case `ArrowUp`:
            moveSuggestionUp();
            break;
          case `ArrowDown`:
            moveSuggestionDown();
            break;
        }
      }
    }
  }, [showSuggestionMenu, queryParams, curSuggestion]);

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
        // sel = $getSelection();
        // const node = $getNodeByKey(sel.focus.key);
        // todo! move caret
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
    const { anchor, focus } = sel;
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

  const renderSuggestionMenu = () => {
    if (!suggestionListRef.current) {
      return null;
    }

    return (
      <SuggestionList
        mountEl={suggestionListRef.current}
        showSuggestionMenu={showSuggestionMenu}
        queryParams={queryParams}
        caretRect={caretRect}
        activeSuggestion={activeSuggestion}
        onResetActive={onResetActive}
        onActiveSuggestionChanged={onActiveSuggestionChanged}
        applySuggestion={() => applySuggestion(queryParams, curSuggestion)}
        moveUp={moveSuggestionUp}
        moveDown={moveSuggestionDown}
      />
    );
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
      <div className="editor-container" onPaste={onPaste} ref={editorRef}>
        <PlainTextPlugin
          contentEditable={<ContentEditable className="editor-input"/>}
          placeholder={<Placeholder/>}
        />
        <OnChangePlugin onChange={onChange}/>
        <HistoryPlugin/>
        <TreeViewPlugin/>
      </div>
      {showSuggestionMenu && <div ref={suggestionListRef}>{renderSuggestionMenu()}</div>}
    </div>
  );
}
