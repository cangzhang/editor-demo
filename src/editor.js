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

export const transformToEditor = (editor, enableToolbar = false, handleUploadFile = () => Promise.resolve()) => {
  // Indicate that the element is editable
  editor.setAttribute('contentEditable', true);

  // Add a custom class
  editor.className = '__editor';

  // Create an exec command function
  const execCommand = (commandId, value) => {
    document.execCommand(commandId, false, value);
    editor.focus();
  };

  // Set default paragraph to <p>
  execCommand('defaultParagraphSeparator', 'p');

  // Create a toolbar
  if (enableToolbar) {
    const toolbar = createToolbar(editor.dataset, execCommand);
    editor.insertAdjacentElement(BEFORE_BEGIN, toolbar);
  }

  // Listen for events to detect where the caret is
  const updateActiveState = () => {
    if (toolbar && enableToolbar) {
      const toolbarSelects = toolbar.querySelectorAll('select[data-command-id]');
      for (const select of toolbarSelects) {
        const value = document.queryCommandValue(select.dataset.commandId);
        const option = Array.from(select.options).find(option => option.value === value);
        select.selectedIndex = option ? option.index : -1;
      }

      const toolbarButtons = toolbar.querySelectorAll('button[data-command-id]');
      for (const button of toolbarButtons) {
        const active = document.queryCommandState(button.dataset.commandId);
        button.classList.toggle('active', active);
      }

      const inputButtons = toolbar.querySelectorAll('input[data-command-id]');
      for (const input of inputButtons) {
        const value = document.queryCommandValue(input.dataset.commandId);
        input.value = rgbToHex(value);
      }

      toolbar.addEventListener('click', updateActiveState);
    }
  };

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

  editor.addEventListener('keydown', updateActiveState);
  editor.addEventListener('keyup', updateActiveState);
  editor.addEventListener('click', updateActiveState);
  editor.addEventListener(`paste`, onPaste);
};
