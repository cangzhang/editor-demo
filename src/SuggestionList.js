import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

export function SuggestionList({
                                 showSuggestionMenu,
                                 caretRect,
                                 queryParams,
                                 activeSuggestion,
                                 mountEl,
                                 onResetActive,
                                 onActiveSuggestionChanged,
                                 moveUp,
                                 moveDown,
                               }) {
  const [list, setList] = useState([]);
  const itemRefs = useRef([]);

  useEffect(() => {
    if (showSuggestionMenu) {
      makeList();
    }
    onResetActive(0);
  }, [showSuggestionMenu]);

  useEffect(() => {
    let idx = activeSuggestion;
    if (activeSuggestion < 0) {
      idx = list.length - 1;
      onResetActive(idx);
    }
    if (activeSuggestion + 1 > list.length) {
      idx = 0;
      onResetActive(idx);
    }

    onActiveSuggestionChanged(list[idx]?.value);
    itemRefs.current[idx]?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSuggestion, list, queryParams]);

  useEffect(() => {
    onActiveSuggestionChanged(list[activeSuggestion]?.value);
  }, [queryParams, list]);

  const makeList = useCallback(() => {
    const [_tag, _scope, query] = queryParams;
    let l = [];
    for (let i = 0; i <= 5; i++) {
      l.push({
        text: `Item ${i} for ${query}`, value: `item-${i + 1}`,
      });
    }
    setList(l);
  }, [queryParams]);

  const onKeyPressed = (ev) => {
    switch (ev.key) {
      case 'ArrowUp':
        moveUp();
        break;
      case `ArrowDown`:
        moveDown();
        break;
      default:
    }
  };

  if (!showSuggestionMenu || !caretRect) {
    return null;
  }

  // let [tag, scope, query] = queryParams;
  return ReactDOM.createPortal(<div
    className={`__editor-suggestion`}
    onKeyDown={onKeyPressed}
    style={{
      position: `fixed`,
      top: `${parseInt(caretRect.top + 20, 10)}px`,
      left: `${parseInt(caretRect.left, 10)}px`,
      border: `1px solid #ccc`,
      display: `flex`,
      width: `11rem`,
      maxHeight: `100px`,
      overflow: `auto`,
      backgroundColor: `white`,
    }}
  >
    <ul>
      {list.map((i, idx) => {
        return <li
          onClick={() => {
            onResetActive(idx);
          }}
          key={idx}
          ref={(el) => {
            itemRefs.current[idx] = el;
          }}
          style={{ backgroundColor: activeSuggestion === idx ? `aquamarine` : `white` }}
        >
          {i.text}
        </li>;
      })}
    </ul>
  </div>, mountEl);
}
