import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

const SAFE_MARGIN = 30;

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
                                 applySuggestion,
                               }) {
  const itemRefs = useRef([]);
  const containerRef = useRef(null);

  const [list, setList] = useState([]);
  const [rect, setRect] = useState({
    left: caretRect?.left,
    top: caretRect?.top,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const { offsetWidth } = container;
    if (caretRect.left + offsetWidth + SAFE_MARGIN > window.innerWidth) {
      setRect({
        left: window.innerWidth - SAFE_MARGIN - offsetWidth,
        top: caretRect.top,
      });
    } else {
      setRect({
        left: caretRect.left,
        top: caretRect.top,
      });
    }
  }, [caretRect]);

  useEffect(() => {
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

  useEffect(() => {
    if (!showSuggestionMenu) {
      setList([]);
      return;
    }

    const [_tag, _scope, query] = queryParams;
    let l = [];
    for (let i = 0; i <= 5; i++) {
      l.push({
        text: `Item ${i} for ${query}`,
        value: `item-${i}`,
      });
    }
    setList(l);
  }, [queryParams, showSuggestionMenu]);

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

  const onClickItem = (i, idx) => () => {
    onResetActive(idx);
    onActiveSuggestionChanged(i.value);
    applySuggestion();
  };

  if (!showSuggestionMenu || !rect || !list.length) {
    return null;
  }

  // let [tag, scope, query] = queryParams;
  return ReactDOM.createPortal(<div
    ref={containerRef}
    className={`__editor-suggestion`}
    onKeyDown={onKeyPressed}
    style={{
      position: `fixed`,
      top: `${parseInt(rect.top + 20, 10)}px`,
      left: `${parseInt(rect.left, 10)}px`,
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
          onClick={onClickItem(i, idx)}
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
