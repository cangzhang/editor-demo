import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

export function SuggestionList({
                                 showSuggestionMenu,
                                 caretRect,
                                 queryParams,
                                 activeSuggestion,
                                 mountEl,
                                 onResetActive,
                                 onActiveSuggestionChanged,
                               }) {
  const [list, setList] = useState([]);

  useEffect(() => {
    let idx = activeSuggestion;
    if (activeSuggestion + 1 > list.length) {
      idx = 0;
      onResetActive();
    }

    onActiveSuggestionChanged(list[idx]?.value);
  }, [activeSuggestion, list, queryParams]);

  useEffect(() => {
    const [tag, scope, query] = queryParams;
    let l = [];
    for (let i = 0; i <= 5; i++) {
      l.push({
        text: `Item ${i + 1} for ${query}`,
        value: `item-${i + 1}`,
      });
    }
    setList(l);
  }, [queryParams]);

  if (!showSuggestionMenu || !caretRect) {
    return null;
  }

  // let [tag, scope, query] = queryParams;
  return ReactDOM.createPortal(
    <div
      className={`__editor-suggestion`}
      style={{
        position: `fixed`,
        top: `${parseInt(caretRect.top + 20, 10)}px`,
        left: `${parseInt(caretRect.left, 10)}px`,
        border: `1px solid #ccc`,
        display: `flex`,
        width: `10rem`,
        overflow: `auto`,
        backgroundColor: `white`,
      }}
    >
      <ul>
        {
          list.map((i, idx) => {
            return <li key={idx}
                       style={{ backgroundColor: activeSuggestion === idx ? `aquamarine` : `white` }}>{i.text}</li>;
          })
        }
      </ul>
    </div>,
    mountEl,
  );
}
