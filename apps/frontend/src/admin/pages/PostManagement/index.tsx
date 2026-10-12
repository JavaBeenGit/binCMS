import React, { useMemo, useState } from 'react';
import { Button, Select, Table, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { postApi, PostCreateRequest, PostResponse, PostUpdateRequest } from '@/shared/api/endpoints/post';
import { boardApi, BoardResponse } from '@/shared/api/endpoints/board';
import PageHeader from '@/admin/components/PageHeader';
import SearchBar from '@/admin/components/SearchBar';
import ListSummary from '@/admin/components/ListSummary';
import { buildPostColumns } from './postColumns';
import PostFormModal, { PostFormSubmit } from './PostFormModal';
import PostDetailModal from './PostDetailModal';

const PAGE_SIZE = 10;

const BOARD_HELP: Record<string, string> = {
  notice: '홈페이지 "공지사항" 메뉴에 그대로 보입니다.',
  faq: '홈페이지 "자주묻는질문" 메뉴에 그대로 보입니다.',
  free: '회원이 쓴 글입니다. 문제가 있는 글은 여기서 삭제할 수 있습니다.',
};

interface PostManagementProps {
  /** notice · faq · free. 없으면 전체 게시판(게시판 선택 가능) */
  boardCode?: string;
}

/**
 * 게시글 관리 — 공지사항 / 자주묻는질문 / 자유게시판 (게시판은 URL로 고정)
 */
const PostManagement: React.FC<PostManagementProps> = ({ boardCode }) => {
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState<number | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PostResponse | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailPost, setDetailPost] = useState<PostResponse | null>(null);
  const queryClient = useQueryClient();

  const { data: boards } = useQuery({
    queryKey: ['boards', 'active'],
    queryFn: async () => (await boardApi.getActiveBoards()).data,
  });

  const fixedBoard = useMemo(
    () => (boardCode ? boards?.find((b: BoardResponse) => b.boardCode === boardCode) : undefined),
    [boardCode, boards],
  );
  const boardId = fixedBoard?.id ?? selectedBoardId;

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', boardId, keyword, page],
    queryFn: async () => {
      if (keyword) return (await postApi.searchPosts({ boardId, keyword, page, size: PAGE_SIZE })).data;
      if (boardId !== undefined) return (await postApi.getPostsByBoard(boardId, page, PAGE_SIZE)).data;
      return (await postApi.getAllPosts(page, PAGE_SIZE)).data;
    },
    // 게시판이 고정된 화면은 게시판 id 를 알기 전에는 조회하지 않는다
    enabled: !boardCode || !!fixedBoard,
  });

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const createMutation = useMutation({
    mutationFn: (data: PostCreateRequest) => postApi.createPost(data),
    onSuccess: () => {
      message.success('게시글이 생성되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      closeForm();
    },
    onError: () => message.error('게시글 생성에 실패했습니다.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PostUpdateRequest }) => postApi.updatePost(id, data),
    onSuccess: () => {
      message.success('게시글이 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      closeForm();
    },
    onError: () => message.error('게시글 수정에 실패했습니다.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => postApi.deletePost(id),
    onSuccess: () => {
      message.success('게시글이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: () => message.error('게시글 삭제에 실패했습니다.'),
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (post: PostResponse) => {
    setDetailOpen(false);
    setEditing(post);
    setFormOpen(true);
  };

  const openDetail = (post: PostResponse) => {
    setDetailPost(post);
    setDetailOpen(true);
  };

  const handleSubmit = (values: PostFormSubmit) => {
    const { boardId: formBoardId, ...rest } = values;
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: rest as PostUpdateRequest });
    } else {
      createMutation.mutate({ ...rest, boardId: fixedBoard?.id ?? formBoardId } as PostCreateRequest);
    }
  };

  const total = posts?.totalElements ?? 0;
  const columns = buildPostColumns({
    showBoard: !boardCode,
    total,
    page,
    pageSize: PAGE_SIZE,
    onDetail: openDetail,
    onEdit: openEdit,
    onDelete: (id) => deleteMutation.mutate(id),
  });

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title={fixedBoard?.boardName || '게시글 관리'}
        description={boardCode ? BOARD_HELP[boardCode] : undefined}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            게시글 작성
          </Button>
        }
      />

      <SearchBar
        placeholder="제목 또는 내용 검색"
        value={keyword}
        onSearch={(k) => {
          setKeyword(k);
          setPage(0);
        }}
      >
        {!boardCode && (
          <Select
            placeholder="게시판 선택"
            style={{ width: 200 }}
            allowClear
            value={selectedBoardId}
            onChange={(v) => {
              setSelectedBoardId(v);
              setPage(0);
            }}
            options={boards?.map((b: BoardResponse) => ({ label: b.boardName, value: b.id }))}
          />
        )}
      </SearchBar>

      <ListSummary total={total} page={page} pageSize={PAGE_SIZE} />
      <Table
        scroll={{ x: 'max-content' }}
        bordered
        columns={columns}
        dataSource={posts?.content || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page + 1,
          pageSize: PAGE_SIZE,
          total,
          showSizeChanger: false,
          onChange: (p) => setPage(p - 1),
        }}
      />

      <PostFormModal
        open={formOpen}
        editing={editing}
        boards={boards}
        fixedBoardName={fixedBoard?.boardName}
        loading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      />
      <PostDetailModal
        open={detailOpen}
        post={detailPost}
        showBoard={!boardCode}
        onClose={() => setDetailOpen(false)}
        onEdit={openEdit}
      />
    </div>
  );
};

export default PostManagement;
