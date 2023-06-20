import React, {useCallback} from 'react';

export const MenuBar = ({editor}) => {
  const widthRef = React.useRef(null)
  const heightRef = React.useRef(null)

  React.useEffect(() => {
    if (widthRef.current && heightRef.current) {
      widthRef.current.value = 640
      heightRef.current.value = 480
    }
  }, [widthRef.current, heightRef.current])

  if (!editor) {
    return null
  }

  const addYoutubeVideo = () => {
    const url = prompt('Enter YouTube URL')

    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: Math.max(320, parseInt(widthRef.current.value, 10)) || 640,
        height: Math.max(180, parseInt(heightRef.current.value, 10)) || 480,
      })
    }
  }

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink()
        .run()

      return
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({href: url})
      .run()
  }, [editor])

  return (
    <div>
      <div>
        <button id="add" onClick={addYoutubeVideo}>Add YouTube video</button>
        <input id="width" type="number" min="320" max="1024" ref={widthRef} placeholder="width"/>
        <input id="height" type="number" min="180" max="720" ref={heightRef} placeholder="height"/>
      </div>
      <div>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={editor.isActive('taskList') ? 'is-active' : ''}
        >
          toggleTaskList
        </button>
        <button
          onClick={() => editor.chain().focus().splitListItem('taskItem').run()}
          disabled={!editor.can().splitListItem('taskItem')}
        >
          splitListItem
        </button>
        <button
          onClick={() => editor.chain().focus().sinkListItem('taskItem').run()}
          disabled={!editor.can().sinkListItem('taskItem')}
        >
          sinkListItem
        </button>
        <button
          onClick={() => editor.chain().focus().liftListItem('taskItem').run()}
          disabled={!editor.can().liftListItem('taskItem')}
        >
          liftListItem
        </button>
      </div>
      <div>
        <button onClick={setLink} className={editor.isActive('link') ? 'is-active' : ''}>
          setLink
        </button>
        <button
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive('link')}
        >
          unsetLink
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          <b>Bold</b>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          <i>Italic</i>
        </button>
      </div>
      <div>
        <button
          onClick={() => editor.chain().focus().toggleHeading({level: 1}).run()}
          className={editor.isActive('heading', {level: 1}) ? 'is-active' : ''}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({level: 2}).run()}
          className={editor.isActive('heading', {level: 2}) ? 'is-active' : ''}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({level: 3}).run()}
          className={editor.isActive('heading', {level: 3}) ? 'is-active' : ''}
        >
          H3
        </button>
      </div>
      <div>
        <button onClick={() => console.log(editor.getHTML())}>Export to HTML</button>
      </div>
    </div>
  )
}
