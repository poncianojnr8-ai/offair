import { useState } from "react";
import RichTextEditor from "../components/Editor/RichTextEditor";

const TestEditor = () => {
  const [value, setValue] = useState("<p>Hello <strong>world</strong></p>");

  const uploadImage = async (file: File) => {
    return URL.createObjectURL(file);
  };

  return (
    <div className="p-8 bg-[var(--bg-primary)] min-h-screen">
      <h1 className="text-white mb-4">Test Editor</h1>
      <RichTextEditor value={value} onChange={setValue} uploadImage={uploadImage} />
    </div>
  );
};

export default TestEditor;
