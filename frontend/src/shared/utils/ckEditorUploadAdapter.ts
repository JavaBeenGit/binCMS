/**
 * CKEditor 5 커스텀 이미지 업로드 어댑터
 * - 파일 서버(/api/v1/files/upload)로 이미지를 업로드하고
 * - 업로드된 URL을 CKEditor에 반환합니다.
 */
import { useAuthStore } from '../../stores/authStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * CKEditor FileLoader에 맞춘 업로드 어댑터
 */
class CKEditorUploadAdapter {
  private loader: any;
  private controller: AbortController;

  constructor(loader: any) {
    this.loader = loader;
    this.controller = new AbortController();
  }

  async upload(): Promise<{ default: string; [key: string]: string }> {
    const file: File = await this.loader.file;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('refType', 'EDITOR');

    const token = useAuthStore.getState().token;

    const response = await fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
      signal: this.controller.signal,
    });

    if (!response.ok) {
      throw new Error('이미지 업로드에 실패했습니다.');
    }

    const result = await response.json();
    const fileData = result.data;

    // default: 에디터에 삽입될 이미지 URL
    return {
      default: fileData.fileUrl,
    };
  }

  abort(): void {
    this.controller.abort();
  }
}

/**
 * CKEditor 커스텀 업로드 어댑터 플러그인
 * - editorConfig.extraPlugins에 추가하여 사용
 */
export function CKEditorUploadAdapterPlugin(editor: any): void {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
    return new CKEditorUploadAdapter(loader);
  };
}
