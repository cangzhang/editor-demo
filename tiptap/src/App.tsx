import './styles.scss'

import React, {useCallback} from 'react'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Text from '@tiptap/extension-text'
import {EditorContent, useEditor} from '@tiptap/react'
import Mention from '@tiptap/extension-mention'
import CharacterCount from '@tiptap/extension-character-count'
import Youtube from '@tiptap/extension-youtube';
import Link from '@tiptap/extension-link'
import Heading from '@tiptap/extension-heading'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Image from '@tiptap/extension-image'

import suggestion from './suggestion'
import {MenuBar} from "./Menubar";

export default function App() {
  const limit = 280

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Link,
      Bold,
      Italic,
      Image,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CharacterCount.configure({
        limit,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion,
      }),
      Youtube.configure({
        controls: false,
      }),
    ],
    content: `
    <div data-youtube-video="">
    <iframe width="640" height="480" allowfullscreen="true" autoplay="false" disablekbcontrols="false"
        enableiframeapi="false" endtime="0" ivloadpolicy="0" loop="false" modestbranding="false" origin="" playlist=""
        src="https://www.youtube.com/embed/WPLmAQFyVIA?controls=0" start="0"></iframe>
</div>
<ul data-type="taskList">
    <li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label>
        <div>
            <p>flour</p>
        </div>
    </li>
    <li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label>
        <div>
            <p>baking powder</p>
        </div>
    </li>
    <li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label>
        <div>
            <p>salt</p>
        </div>
    </li>
    <li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label>
        <div>
            <p>sugar</p>
        </div>
    </li>
    <li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label>
        <div>
            <p>milk</p>
        </div>
    </li>
    <li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label>
        <div>
            <p>eggs</p>
        </div>
    </li>
    <li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label>
        <div>
            <p>butter</p>
        </div>
    </li>
</ul>
<p><span data-type="mention" class="mention" data-id="Cyndi Lauper">@Cyndi Lauper</span> plz <strong>check</strong>
    <em>here!</em></p>
<p><a target="_blank" rel="noopener noreferrer nofollow" href="https://en.wikipedia.org/wiki/World_Wide_Web">world wide
        web</a></p>
<h1>This is a 1st level heading</h1>
<h2>This is a 2nd level heading</h2>
<h3>This is a 3rd level heading</h3>
<img src="https://source.unsplash.com/8xznAGy4HcY/400x200" />
`,
  })

  const percentage = editor
    ? Math.round((100 / limit) * editor.storage.characterCount.characters())
    : 0

  if (!editor) {
    return null
  }

  return (
    <div>
      <MenuBar editor={editor}/>

      <EditorContent editor={editor}/>
      {editor
        && <div
          className={`character-count ${editor.storage.characterCount.characters() === limit ? 'character-count--warning' : ''}`}>
          <svg
            height="20"
            width="20"
            viewBox="0 0 20 20"
            className="character-count__graph"
          >
            <circle
              r="10"
              cx="10"
              cy="10"
              fill="#e9ecef"
            />
            <circle
              r="5"
              cx="10"
              cy="10"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={`calc(${percentage} * 31.4 / 100) 31.4`}
              transform="rotate(-90) translate(-20)"
            />
            <circle
              r="6"
              cx="10"
              cy="10"
              fill="white"
            />
          </svg>

          <div className="character-count__text">
            {editor.storage.characterCount.characters()}/{limit} characters
          </div>
        </div>
      }
    </div>
  )
}
