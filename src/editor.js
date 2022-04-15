const DEFAULT_INPUT_TRIGGER_TIMEOUT = 500;
const ToolbarActions = [{
  name: `H1`, actionId: `h1`, action: `insert`, target: `wholeLine`, position: `before`, value: `# `,
},];

export const transformToEditor = (editor, config = {}) => {
  const {
    handleUploadFile = () => Promise.resolve(), onInput = () => null, getInputTriggerTimeout = () => 0,
  } = config;

  // Indicate that the element is editable
  editor.setAttribute('contentEditable', true);

  // Add a custom class
  editor.className = '__editor';
  initEditor()

  function initEditor() {
    let p = document.createElement(`p`);
    p.appendChild(document.createElement(`br`));
    editor.appendChild(p);

    editor.focus();

    let range = document.createRange();
    let sel = document.getSelection();
    range.setStart(p, 0);
    range.collapse(true);
    sel.removeAllRanges()
    sel.addRange(range)
  }

  function findParagraph(node) {
    while (node = node.parentElement) {
      if (node.tagName === `P`) {
        return node;
      }
      if (node === editor) {
        break;
      }
    }

    return node;
  }

  const performToolbarAction = (option = {}) => {
    editor.focus();
    const sel = window.getSelection();
    const { target, position, value } = option;

    if (target === `wholeLine`) {
      const paragraph = findParagraph(sel.anchorNode);
      const node = document.createElement(`span`);
      node.innerHTML = value;
      if (position === `before`) {
        paragraph.prepend(node);
      }
    }
  };

  const initToolbar = () => {
    const toolbar = document.createElement(`div`);
    toolbar.className = `__editor-toolbar`;
    for (const i of ToolbarActions) {
      const button = document.createElement(`button`);
      button.className = `__editor-toolbar-button`;
      button.innerHTML = i.name;
      button.setAttribute(`data-action`, i.actionId);
      button.setAttribute(`data-position`, i.position);
      toolbar.appendChild(button);
      button.addEventListener(`click`, () => {
        performToolbarAction(i);
      });
    }

    editor.parentNode.appendChild(toolbar);
  };

  initToolbar();

  // Create an exec command function
  const execCommand = (commandId, value) => {
    document.execCommand(commandId, false, value);
    editor.focus();
  };

  // Set default paragraph to <p>
  execCommand('defaultParagraphSeparator', 'p');

  const insertContent = (str) => {
    const span = document.createElement(`span`);
    span.innerText = str;

    let sel = window.getSelection();
    let range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(span);

    // set caret to end
    const textRange = document.createRange();
    textRange.selectNodeContents(span);
    textRange.collapse(false);
    sel.removeAllRanges();
    sel.addRange(textRange);
  }

  const handleStr = item => {
    const { type } = item;

    if (type === 'text/plain') {
      item.getAsString(str => {
        insertContent(str);
        // execCommand(`insertText`, str);
      });
    }

    if (type === `text/html`) {
      let div = document.createElement('div');
      item.getAsString(html => {
        div.innerHTML = html;
        insertContent(div.innerText);
        // execCommand(`insertHTML`, div.innerText);
        div = null;
      });
    }
  };

  const onPaste = ev => {
    const { items } = ev.clipboardData;
    for (const i of items) {
      const { type, kind } = i;
      console.log(`__type: ${type}, __kind: ${kind}`);
      ev.preventDefault();

      if (kind === 'string') {
        handleStr(i);
        continue;
      }

      if (kind === `file`) {
        if (type.startsWith('image/')) {
          console.log(`todo! upload image`);
        }

        if (type.startsWith(`video/`)) {
          console.info(`todo! handle video`);
        }
      }
    }
  };

  const onKeyDown = (ev) => {
    if (ev.key === `Backspace`) {
      if (editor.childNodes.length === 1) {
        const p = editor.childNodes[0];
        if (p.innerHTML === `<br>`) {
          ev.preventDefault();
        }
      }
    }
  }

  const onInputHandler = () => {
    let timer = null;

    return (ev) => {
      if (timer) {
        clearTimeout(timer);
      }

      const timeout = getInputTriggerTimeout(ev) || DEFAULT_INPUT_TRIGGER_TIMEOUT;

      timer = setTimeout(() => {
        console.log(`trigger <onInput>`);
        onInput(ev);
        clearTimeout(timer);
        timer = null;
      }, timeout);
    };
  };

  // editor.addEventListener('keydown', updateActiveState);
  // editor.addEventListener('keyup', updateActiveState);
  // editor.addEventListener('click', updateActiveState);

  editor.addEventListener(`paste`, onPaste);
  editor.addEventListener(`keyup`, onInputHandler());
  editor.addEventListener(`keydown`, onKeyDown);
};
