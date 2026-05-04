import React, { useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  readOnly?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, readOnly = false }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when value prop changes externally
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  if (readOnly) {
    return (
      <div 
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: value || '' }}
      />
    );
  }

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    
    if (url === null) {
      return;
    }
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  return (
    <div className="rich-text-editor border border-slate-800 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="bg-slate-950/50 border-b border-slate-800 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded hover:bg-slate-800 text-sm font-bold text-slate-300 ${
            editor.isActive('bold') ? 'bg-slate-700 text-white' : ''
          }`}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded hover:bg-slate-800 text-sm italic text-slate-300 ${
            editor.isActive('italic') ? 'bg-slate-700 text-white' : ''
          }`}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 rounded hover:bg-slate-800 text-sm underline text-slate-300 ${
            editor.isActive('underline') ? 'bg-slate-700 text-white' : ''
          }`}
          title="Underline"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 rounded hover:bg-slate-800 text-sm line-through text-slate-300 ${
            editor.isActive('strike') ? 'bg-slate-700 text-white' : ''
          }`}
          title="Strikethrough"
        >
          S
        </button>

        <div className="w-px bg-slate-700 mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded hover:bg-slate-800 text-sm text-slate-300 ${
            editor.isActive('heading', { level: 1 }) ? 'bg-slate-700 text-white' : ''
          }`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded hover:bg-slate-800 text-sm text-slate-300 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-slate-700 text-white' : ''
          }`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 rounded hover:bg-slate-800 text-sm text-slate-300 ${
            editor.isActive('heading', { level: 3 }) ? 'bg-slate-700 text-white' : ''
          }`}
          title="Heading 3"
        >
          H3
        </button>

        <div className="w-px bg-slate-700 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded hover:bg-slate-800 text-sm text-slate-300 ${
            editor.isActive('bulletList') ? 'bg-slate-700 text-white' : ''
          }`}
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded hover:bg-slate-800 text-sm text-slate-300 ${
            editor.isActive('orderedList') ? 'bg-slate-700 text-white' : ''
          }`}
          title="Numbered List"
        >
          1. List
        </button>

        <div className="w-px bg-slate-700 mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`px-2 py-1 rounded hover:bg-slate-800 text-sm text-slate-300 ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-slate-700 text-white' : ''
          }`}
          title="Align Left"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`px-2 py-1 rounded hover:bg-slate-800 text-sm text-slate-300 ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-slate-700 text-white' : ''
          }`}
          title="Align Center"
        >
          ↔
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`px-2 py-1 rounded hover:bg-slate-800 text-sm text-slate-300 ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-slate-700 text-white' : ''
          }`}
          title="Align Right"
        >
          →
        </button>

        <div className="w-px bg-slate-700 mx-1" />

        {/* Link */}
        <button
          type="button"
          onClick={addLink}
          className={`px-2 py-1 rounded hover:bg-slate-800 text-sm text-slate-300 ${
            editor.isActive('link') ? 'bg-slate-700 text-white' : ''
          }`}
          title="Add Link"
        >
          🔗
        </button>

        <div className="w-px bg-slate-700 mx-1" />

        {/* Undo/Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="px-2 py-1 rounded hover:bg-slate-800 text-sm text-slate-300 disabled:opacity-50"
          title="Undo"
        >
          ↩
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="px-2 py-1 rounded hover:bg-slate-800 text-sm text-slate-300 disabled:opacity-50"
          title="Redo"
        >
          ↪
        </button>
      </div>

      {/* Editor Content */}
      <div className="p-3 min-h-[120px] bg-slate-900 text-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
