import { createToolbar } from './toolbar';
import { BEFORE_BEGIN } from './constants';

const rgbToHex = color => {
  const digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);
  const red = parseInt(digits[2]);
  const green = parseInt(digits[3]);
  const blue = parseInt(digits[4]);
  const rgb = blue | (green << 8) | (red << 16);

  return digits[1] + '#' + rgb.toString(16).padStart(6, '0');
};

const DEFAULT_INPUT_TRIGGER_TIMEOUT = 500;
const ToolbarActions = [
  {
    name: `H1`,
    actionId: `h1`,
    action: `insert`,
    for: `wholeline`,
    place: `before`,
  },
];

export const transformToEditor = (editor, config = {}) => {
  const {
    handleUploadFile = () => Promise.resolve(),
    onInput = () => null,
    getInputTriggerTimeout = () => 0,
  } = config;

  // Indicate that the element is editable
  editor.setAttribute('contentEditable', true);

  // Add a custom class
  editor.className = '__editor';

  const performToolbarAction = option => {
    const node = window.getSelection().focusNode;
    console.log(node, option);
  };

  const initToolbar = () => {
    const toolbar = document.createElement(`div`);
    toolbar.className = `__editor-toolbar`;
    for (const i of ToolbarActions) {
      const button = document.createElement(`button`);
      button.className = `__editor-toolbar-button`;
      button.innerHTML = i.name;
      button.setAttribute(`data-action`, i.actionId);
      button.setAttribute(`data-place`, i.place);
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

  const handleStr = item => {
    const { type } = item;

    if (type === 'text/plain') {
      item.getAsString(str => {
        execCommand(`insertText`, str);
      });
    }

    if (type === `text/html`) {
      let div = document.createElement('div');
      item.getAsString(html => {
        div.innerHTML = html;
        execCommand(`insertHTML`, div.innerText);
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
          console.info(`todo!: handle video`);
        }
      }
    }
  };

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
};
