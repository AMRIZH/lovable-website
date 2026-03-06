import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, ListOrdered, LinkIcon, Heading2 } from "lucide-react";
import { useCallback } from "react";

type Props = {
  content: string;
  onChange: (html: string) => void;
};

export default function RichTextEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-input bg-background">
      <div className="flex flex-wrap gap-1 border-b p-2">
        <Button type="button" variant={editor.isActive("bold") ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant={editor.isActive("italic") ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant={editor.isActive("heading") ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant={editor.isActive("bulletList") ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant={editor.isActive("orderedList") ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button type="button" variant={editor.isActive("link") ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={setLink}>
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
