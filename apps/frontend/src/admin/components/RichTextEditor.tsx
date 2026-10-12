import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor, Essentials, Bold, Italic, Underline, Strikethrough,
  Heading, Paragraph, Link, List, BlockQuote, Table,
  TableToolbar, Indent, IndentBlock, MediaEmbed, Alignment,
  Font, HorizontalLine, SourceEditing, HtmlEmbed, Image,
  ImageToolbar, ImageCaption, ImageStyle, ImageResize, ImageUpload, PasteFromOffice,
  CodeBlock, RemoveFormat, FindAndReplace, Highlight, PageBreak,
  SpecialCharacters, SpecialCharactersEssentials,
  GeneralHtmlSupport,
  type EditorConfig,
} from 'ckeditor5';
import koTranslations from 'ckeditor5/translations/ko.js';
import { CKEditorUploadAdapterPlugin } from '@/shared/utils/ckEditorUploadAdapter';

/**
 * 관리자 본문 편집기 공용 설정. 공지/FAQ·시공사례·팝업·컨텐츠가 모두 이 설정을 쓴다.
 * 이미지 업로드는 POST /api/v1/user/files/upload (ckEditorUploadAdapter).
 */
const editorConfig: EditorConfig = {
  licenseKey: 'GPL',
  plugins: [
    Essentials, Bold, Italic, Underline, Strikethrough,
    Heading, Paragraph, Link, List, BlockQuote, Table,
    TableToolbar, Indent, IndentBlock, MediaEmbed, Alignment,
    Font, HorizontalLine, SourceEditing, HtmlEmbed, Image,
    ImageToolbar, ImageCaption, ImageStyle, ImageResize, ImageUpload, PasteFromOffice,
    CodeBlock, RemoveFormat, FindAndReplace, Highlight, PageBreak,
    SpecialCharacters, SpecialCharactersEssentials,
    GeneralHtmlSupport,
  ],
  extraPlugins: [CKEditorUploadAdapterPlugin],
  htmlSupport: {
    allow: [{ name: /.*/, attributes: true, classes: true, styles: true }],
  },
  toolbar: {
    items: [
      'heading', '|',
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
      'alignment', '|',
      'bulletedList', 'numberedList', 'outdent', 'indent', '|',
      'link', 'insertImage', 'blockQuote', 'insertTable', 'mediaEmbed', 'horizontalLine', '|',
      'codeBlock', 'htmlEmbed', 'specialCharacters', 'pageBreak', '|',
      'highlight', 'removeFormat', 'findAndReplace', '|',
      'sourceEditing', '|',
      'undo', 'redo',
    ],
    shouldNotGroupWhenFull: true,
  },
  image: {
    toolbar: ['imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'toggleImageCaption', 'imageTextAlternative', '|', 'resizeImage'],
    resizeOptions: [
      { name: 'resizeImage:original', value: null, label: '원본' },
      { name: 'resizeImage:25', value: '25', label: '25%' },
      { name: 'resizeImage:50', value: '50', label: '50%' },
      { name: 'resizeImage:75', value: '75', label: '75%' },
    ],
  },
  table: { contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'] },
  language: 'ko',
  translations: [koTranslations], // 툴바·메뉴 한국어
};

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  /** 편집 영역 최소 높이(px). 기본 400 */
  minHeight?: number;
}

/**
 * 모달이 열릴 때마다 새로 마운트해서 쓴다 (`{open && <RichTextEditor …/>}`) — 이전 글 내용이 남지 않는다.
 */
const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, minHeight = 400 }) => (
  <div className="rich-text-editor">
    <style>{`.rich-text-editor .ck-editor__editable { min-height: ${minHeight}px; }`}</style>
    <CKEditor
      editor={ClassicEditor}
      config={editorConfig}
      data={value}
      onChange={(_event, editor) => onChange(editor.getData())}
    />
  </div>
);

export default RichTextEditor;
