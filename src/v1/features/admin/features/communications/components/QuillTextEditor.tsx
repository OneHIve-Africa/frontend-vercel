import { forwardRef, useImperativeHandle, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface propsType {
  value: string;
  onChange: (value: string) => void;
}
export type QuillTextEditorRef = {
  insertPlaceholder: (text: string) => void;
};

const QuillTextEditor = forwardRef<QuillTextEditorRef, propsType>(({ onChange, value }, ref) => {
  const quillRef = useRef<ReactQuill | null>(null);
  const toolbarOptions = [
    ["bold", "italic", "underline", "strike"], // toggled buttons
    ["blockquote", "code-block"],
    // ["link", "image", "video"],
    // "image", "video", "formula"

    // [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
    // [{ script: "sub" }, { script: "super" }], // superscript/subscript
    // [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
    // [{ direction: "rtl" }], // text direction

    // [{ size: ["small", false, "large", "huge"] }], // custom dropdown
    // [{ header: [1, 2, 3, 4, 5, 6, false] }],

    // [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    // [{ font: [] }],
    // [{ align: [] }],

    // ["clean"], // remove formatting button
  ];

  const module = {
    toolbar: toolbarOptions,
  };

  useImperativeHandle(ref, () => ({
    insertPlaceholder: (text: string) => {
      const editor = quillRef.current?.getEditor?.();
      if (!editor) return;
      const range = editor.getSelection(true);
      const index = range ? range.index : editor.getLength();
      editor.insertText(index, text);
      editor.setSelection(index + text.length, 0);
    },
  }));
  return (
    <>
      <ReactQuill
        ref={quillRef}
        modules={module}
        onChange={onChange}
        value={value}
        theme="snow"
        placeholder="Create message....."
        className="w-full h-[180px] font-[400] text-[16px] text-[#000000ce]"
      />
    </>
  );
});

export default QuillTextEditor;
