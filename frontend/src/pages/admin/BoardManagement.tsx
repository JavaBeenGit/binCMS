import React, { useState } from 'react';
import { Table, Button, Space, Tag, Popconfirm, message, Modal, Form, Input, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import {
  getAllBoards,
  createBoard,
  updateBoard,
  deleteBoard,
  activateBoard,
  type BoardResponse,
  type BoardCreateRequest,
  type BoardUpdateRequest,
} from '../../api/endpoints/board';

/**
 * 게시판 관리 페이지
 */
const BoardManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<BoardResponse | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // 게시판 목록 조회
  const { data: boardsData, isLoading } = useQuery({
    queryKey: ['boards'],
    queryFn: getAllBoards,
  });

  // 게시판 생성
  const createMutation = useMutation({
    mutationFn: createBoard,
    onSuccess: (response) => {
      message.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      handleCancel();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '게시판 생성에 실패했습니다');
    },
  });

  // 게시판 수정
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BoardUpdateRequest }) =>
      updateBoard(id, data),
    onSuccess: (response) => {
      message.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      handleCancel();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '게시판 수정에 실패했습니다');
    },
  });

  // 게시판 삭제
  const deleteMutation = useMutation({
    mutationFn: deleteBoard,
    onSuccess: (response) => {
      message.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '게시판 삭제에 실패했습니다');
    },
  });

  // 게시판 활성화
  const activateMutation = useMutation({
    mutationFn: activateBoard,
    onSuccess: (response) => {
      message.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '게시판 활성화에 실패했습니다');
    },
  });

  const handleCreate = () => {
    setEditingBoard(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (board: BoardResponse) => {
    setEditingBoard(board);
    form.setFieldsValue({
      boardCode: board.boardCode,
      boardName: board.boardName,
      description: board.description,
      sortOrder: board.sortOrder,
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingBoard(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingBoard) {
        // 수정
        const { boardCode, ...updateData } = values;
        updateMutation.mutate({ id: editingBoard.id, data: updateData });
      } else {
        // 생성
        createMutation.mutate(values);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleActivate = (id: number) => {
    activateMutation.mutate(id);
  };

  const columns: ColumnsType<BoardResponse> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
    },
    {
      title: '게시판 코드',
      dataIndex: 'boardCode',
      key: 'boardCode',
      width: 150,
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
    },
    {
      title: '게시판 이름',
      dataIndex: 'boardName',
      key: 'boardName',
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
    },
    {
      title: '정렬 순서',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 100,
      align: 'center',
    },
    {
      title: '사용 여부',
      dataIndex: 'useYn',
      key: 'useYn',
      width: 100,
      align: 'center',
      render: (useYn: string) => (
        <Tag color={useYn === 'Y' ? 'green' : 'red'}>
          {useYn === 'Y' ? '사용' : '미사용'}
        </Tag>
      ),
    },
    {
      title: '등록일',
      dataIndex: 'regDt',
      key: 'regDt',
      width: 180,
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
      render: (date: string) => new Date(date).toLocaleString('ko-KR'),
    },
    {
      title: '작업',
      key: 'action',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            수정
          </Button>
          {record.useYn === 'Y' ? (
            <Popconfirm
              title="게시판을 비활성화하시겠습니까?"
              onConfirm={() => handleDelete(record.id)}
              okText="예"
              cancelText="아니오"
            >
              <Button type="link" size="small" danger icon={<StopOutlined />}>
                비활성화
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="게시판을 활성화하시겠습니까?"
              onConfirm={() => handleActivate(record.id)}
              okText="예"
              cancelText="아니오"
            >
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
              >
                활성화
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>게시판 관리</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          게시판 생성
        </Button>
      </div>

      <Table
        bordered
        columns={columns}
        dataSource={boardsData?.data || []}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingBoard ? '게시판 수정' : '게시판 생성'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="boardCode"
            label="게시판 코드"
            rules={[
              { required: true, message: '게시판 코드를 입력해주세요' },
              {
                pattern: /^[a-z0-9_]+$/,
                message: '영문 소문자, 숫자, 언더스코어만 사용 가능합니다',
              },
            ]}
          >
            <Input
              placeholder="예: notice, faq, qna"
              disabled={!!editingBoard}
              maxLength={50}
            />
          </Form.Item>

          <Form.Item
            name="boardName"
            label="게시판 이름"
            rules={[{ required: true, message: '게시판 이름을 입력해주세요' }]}
          >
            <Input placeholder="예: 공지사항, FAQ, Q&A" maxLength={100} />
          </Form.Item>

          <Form.Item name="description" label="설명">
            <Input.TextArea
              placeholder="게시판에 대한 설명을 입력해주세요"
              rows={3}
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label="정렬 순서"
            initialValue={0}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BoardManagement;
