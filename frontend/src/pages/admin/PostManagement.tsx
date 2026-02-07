import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, Switch, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor, Essentials, Bold, Italic, Underline, Strikethrough,
  Heading, Paragraph, Link, List, BlockQuote, Table as CKTable,
  TableToolbar, Indent, IndentBlock, MediaEmbed, Alignment,
  Font, HorizontalLine, SourceEditing, HtmlEmbed, Image,
  ImageToolbar, ImageCaption, ImageStyle, ImageResize, ImageUpload, PasteFromOffice,
  CodeBlock, RemoveFormat, FindAndReplace, Highlight, PageBreak,
  SpecialCharacters, SpecialCharactersEssentials,
  GeneralHtmlSupport,
} from 'ckeditor5';
import { CKEditorUploadAdapterPlugin } from '../../shared/utils/ckEditorUploadAdapter';
import { postApi, PostCreateRequest, PostUpdateRequest, PostResponse } from '../../api/endpoints/post';
import { boardApi, BoardResponse } from '../../api/endpoints/board';
import type { ColumnsType } from 'antd/es/table';

interface PostFormValues {
  boardId: number;
  title: string;
  noticeYn: boolean;
}

interface PostManagementProps {
  boardCode?: string;
}

const PostManagement: React.FC<PostManagementProps> = ({ boardCode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostResponse | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<number | undefined>();
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [editorData, setEditorData] = useState<string>('');
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // CKEditor 설정
  const editorConfig = {
    licenseKey: 'GPL',
    plugins: [
      Essentials, Bold, Italic, Underline, Strikethrough,
      Heading, Paragraph, Link, List, BlockQuote, CKTable,
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
  } as any;

  // 게시판 목록 조회
  const { data: boardsData } = useQuery({
    queryKey: ['boards', 'active'],
    queryFn: async () => {
      const response = await boardApi.getActiveBoards();
      return response.data;
    }
  });

  // boardCode로 해당 게시판 ID 자동 매핑
  const fixedBoardId = React.useMemo(() => {
    if (!boardCode || !boardsData) return undefined;
    const found = boardsData.find((b: BoardResponse) => b.boardCode === boardCode);
    return found?.id;
  }, [boardCode, boardsData]);

  const effectiveBoardId = fixedBoardId ?? selectedBoardId;

  // 게시글 목록 조회
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['posts', effectiveBoardId, searchKeyword],
    queryFn: async () => {
      if (searchKeyword && effectiveBoardId) {
        const response = await postApi.searchPosts({ boardId: effectiveBoardId, keyword: searchKeyword });
        return response.data;
      } else if (effectiveBoardId) {
        const response = await postApi.getPostsByBoard(effectiveBoardId);
        return response.data;
      } else if (searchKeyword) {
        const response = await postApi.searchPosts({ keyword: searchKeyword });
        return response.data;
      } else {
        const response = await postApi.getAllPosts();
        return response.data;
      }
    }
  });

  // 게시글 생성
  const createMutation = useMutation({
    mutationFn: (data: PostCreateRequest) => postApi.createPost(data),
    onSuccess: () => {
      message.success('게시글이 생성되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      handleCancel();
    },
    onError: () => {
      message.error('게시글 생성에 실패했습니다.');
    }
  });

  // 게시글 수정
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PostUpdateRequest }) => postApi.updatePost(id, data),
    onSuccess: () => {
      message.success('게시글이 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      handleCancel();
    },
    onError: () => {
      message.error('게시글 수정에 실패했습니다.');
    }
  });

  // 게시글 삭제
  const deleteMutation = useMutation({
    mutationFn: (id: number) => postApi.deletePost(id),
    onSuccess: () => {
      message.success('게시글이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: () => {
      message.error('게시글 삭제에 실패했습니다.');
    }
  });

  const handleCreate = () => {
    setEditingPost(null);
    form.resetFields();
    setEditorData('');
    setIsModalOpen(true);
  };

  const handleEdit = (post: PostResponse) => {
    setEditingPost(post);
    form.setFieldsValue({
      boardId: post.boardId,
      title: post.title,
      noticeYn: post.noticeYn === 'Y'
    });
    setEditorData(post.content || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingPost(null);
    form.resetFields();
    setEditorData('');
  };

  const handleSubmit = async () => {
    try {
      if (!editorData.trim()) {
        message.warning('내용을 입력해주세요.');
        return;
      }
      const values = await form.validateFields();
      const formData: PostFormValues = values;
      
      const requestData = {
        ...formData,
        content: editorData,
        boardId: fixedBoardId ?? formData.boardId,
        noticeYn: formData.noticeYn ? 'Y' : 'N'
      };

      if (editingPost) {
        const { boardId, ...updateData } = requestData;
        updateMutation.mutate({ id: editingPost.id, data: updateData });
      } else {
        createMutation.mutate(requestData as PostCreateRequest);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // boardCode가 고정된 경우 게시판명 구하기
  const fixedBoardName = React.useMemo(() => {
    if (!boardCode || !boardsData) return '';
    const found = boardsData.find((b: BoardResponse) => b.boardCode === boardCode);
    return found?.boardName || '';
  }, [boardCode, boardsData]);

  const columns: ColumnsType<PostResponse> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
    },
    ...(!boardCode ? [{
      title: '게시판',
      dataIndex: 'boardName',
      key: 'boardName',
      width: 120,
      onHeaderCell: () => ({ style: { textAlign: 'center' as const } }),
    }] : []),
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
      render: (text, record) => (
        <Space>
          {record.noticeYn === 'Y' && <Tag color="red">공지</Tag>}
          {text}
        </Space>
      ),
    },
    {
      title: '조회수',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 100,
      align: 'center',
    },
    {
      title: '작성일',
      dataIndex: 'regDt',
      key: 'regDt',
      width: 180,
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
      render: (text) => new Date(text).toLocaleString('ko-KR'),
    },
    {
      title: '상태',
      dataIndex: 'useYn',
      key: 'useYn',
      width: 80,
      align: 'center',
      render: (useYn) => (
        <Tag color={useYn === 'Y' ? 'green' : 'red'}>
          {useYn === 'Y' ? '사용' : '미사용'}
        </Tag>
      ),
    },
    {
      title: '작업',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            size="small"
          >
            수정
          </Button>
          <Popconfirm
            title="게시글을 삭제하시겠습니까?"
            onConfirm={() => handleDelete(record.id)}
            okText="예"
            cancelText="아니오"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
              size="small"
            >
              삭제
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{fixedBoardName || '게시글 관리'}</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          게시글 작성
        </Button>
      </div>

      <Space style={{ marginBottom: 16 }} size="middle">
        {!boardCode && (
          <Select
            placeholder="게시판 선택"
            style={{ width: 200 }}
            allowClear
            value={selectedBoardId}
            onChange={setSelectedBoardId}
            options={boardsData?.map((board: BoardResponse) => ({
              label: board.boardName,
              value: board.id
            }))}
          />
        )}
        <Input.Search
          placeholder="제목 또는 내용 검색"
          style={{ width: 300 }}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onSearch={() => queryClient.invalidateQueries({ queryKey: ['posts'] })}
          allowClear
        />
      </Space>

      <Table
        bordered
        columns={columns}
        dataSource={postsData?.content || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: (postsData?.pageable?.pageNumber || 0) + 1,
          pageSize: postsData?.pageable?.pageSize || 20,
          total: postsData?.totalElements || 0,
          showSizeChanger: true,
          showTotal: (total) => `총 ${total}개`,
        }}
      />

      <Modal
        title={editingPost ? '게시글 수정' : '게시글 작성'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={1000}
        okText={editingPost ? '수정' : '작성'}
        cancelText="취소"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ noticeYn: false }}
        >
          {!boardCode ? (
            <Form.Item
              name="boardId"
              label="게시판"
              rules={[{ required: true, message: '게시판을 선택해주세요.' }]}
            >
              <Select
                placeholder="게시판 선택"
                disabled={!!editingPost}
                options={boardsData?.map((board: BoardResponse) => ({
                  label: board.boardName,
                  value: board.id
                }))}
              />
            </Form.Item>
          ) : (
            <Form.Item label="게시판">
              <Input value={fixedBoardName} disabled />
            </Form.Item>
          )}

          <Form.Item
            name="title"
            label="제목"
            rules={[
              { required: true, message: '제목을 입력해주세요.' },
              { max: 200, message: '제목은 200자 이내로 입력해주세요.' }
            ]}
          >
            <Input placeholder="제목을 입력하세요" />
          </Form.Item>

          <Form.Item label="내용" required>
            <div className="post-editor-wrapper">
              <style>{`.post-editor-wrapper .ck-editor__editable { min-height: 400px; }`}</style>
              {isModalOpen && (
                <CKEditor
                  editor={ClassicEditor}
                  config={editorConfig}
                  data={editorData}
                  onChange={(_event, editor) => {
                    setEditorData(editor.getData());
                  }}
                />
              )}
            </div>
          </Form.Item>

          <Form.Item
            name="noticeYn"
            label="공지글"
            valuePropName="checked"
          >
            <Switch checkedChildren="공지" unCheckedChildren="일반" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PostManagement;
