import React, { useState } from 'react';
import {
  Table, Tag, Button, Modal, Descriptions, Input, Select, Space,
  message, Badge, Tooltip, Card, Row, Col, Statistic,
} from 'antd';
import {
  EyeOutlined, EditOutlined, PhoneOutlined, MailOutlined,
  EnvironmentOutlined, UserOutlined, CheckCircleOutlined,
  ClockCircleOutlined, SyncOutlined, CloseCircleOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inquiryApi, InquiryResponse } from '../../api/endpoints/inquiry';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TextArea } = Input;

// 상태 관련 매핑
const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: '대기', color: 'orange', icon: <ClockCircleOutlined /> },
  IN_PROGRESS: { label: '처리중', color: 'processing', icon: <SyncOutlined spin /> },
  COMPLETED: { label: '완료', color: 'success', icon: <CheckCircleOutlined /> },
  CANCELLED: { label: '취소', color: 'default', icon: <CloseCircleOutlined /> },
};

// 시공유형 매핑 (사용자 화면과 동일)
const TYPE_MAP: Record<string, string> = {
  apartment: '아파트',
  villa: '빌라',
  office: '사무실',
  store: '상가',
  other: '기타',
};

// 예산 매핑 (사용자 화면과 동일)
const BUDGET_MAP: Record<string, string> = {
  under1000: '1,000만원 이하',
  '1000-3000': '1,000 ~ 3,000만원',
  '3000-5000': '3,000 ~ 5,000만원',
  over5000: '5,000만원 이상',
  consult: '상담 후 결정',
};

const InquiryManagement: React.FC = () => {
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [memoModalOpen, setMemoModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryResponse | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [newStatus, setNewStatus] = useState<string>('');
  const [newMemo, setNewMemo] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  // 목록 조회
  const { data, isLoading } = useQuery({
    queryKey: ['inquiries', currentPage, filterStatus],
    queryFn: () => inquiryApi.getAll(currentPage - 1, 10, filterStatus),
  });

  // 상세 조회
  const { data: detailData } = useQuery({
    queryKey: ['inquiry', selectedInquiry?.id],
    queryFn: () => inquiryApi.getById(selectedInquiry!.id),
    enabled: !!selectedInquiry?.id && detailModalOpen,
  });

  // 상태 변경
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      inquiryApi.updateStatus(id, status),
    onSuccess: () => {
      message.success('상태가 변경되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['inquiry'] });
      setStatusModalOpen(false);
    },
    onError: () => message.error('상태 변경에 실패했습니다.'),
  });

  // 메모 수정
  const memoMutation = useMutation({
    mutationFn: ({ id, memo }: { id: number; memo: string }) =>
      inquiryApi.updateMemo(id, memo),
    onSuccess: () => {
      message.success('메모가 저장되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['inquiry'] });
      setMemoModalOpen(false);
    },
    onError: () => message.error('메모 저장에 실패했습니다.'),
  });

  const inquiries = data?.data?.content || [];
  const totalElements = data?.data?.totalElements || 0;

  // 통계 계산
  const allInquiries = inquiries;
  const pendingCount = allInquiries.filter(i => i.status === 'PENDING').length;
  const inProgressCount = allInquiries.filter(i => i.status === 'IN_PROGRESS').length;
  const completedCount = allInquiries.filter(i => i.status === 'COMPLETED').length;

  // 상세보기
  const handleViewDetail = (record: InquiryResponse) => {
    setSelectedInquiry(record);
    setDetailModalOpen(true);
  };

  // 상태 변경 모달
  const handleOpenStatusModal = (record: InquiryResponse) => {
    setSelectedInquiry(record);
    setNewStatus(record.status);
    setStatusModalOpen(true);
  };

  // 메모 모달
  const handleOpenMemoModal = (record: InquiryResponse) => {
    setSelectedInquiry(record);
    setNewMemo(record.adminMemo || '');
    setMemoModalOpen(true);
  };

  const columns: ColumnsType<InquiryResponse> = [
    {
      title: '번호',
      key: 'no',
      width: 70,
      align: 'center',
      render: (_: unknown, __: InquiryResponse, index: number) =>
        totalElements - ((currentPage - 1) * 10) - index,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: string) => {
        const s = STATUS_MAP[status] || { label: status, color: 'default', icon: null };
        return <Tag icon={s.icon} color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (name: string) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <strong>{name}</strong>
        </Space>
      ),
    },
    {
      title: '연락처',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (phone: string) => (
        <Space>
          <PhoneOutlined style={{ color: '#52c41a' }} />
          {phone}
        </Space>
      ),
    },
    {
      title: '시공유형',
      dataIndex: 'inquiryType',
      key: 'inquiryType',
      width: 100,
      align: 'center',
      render: (type: string) => (
        <Tag color="blue">{TYPE_MAP[type] || type}</Tag>
      ),
    },
    {
      title: '예산',
      dataIndex: 'budget',
      key: 'budget',
      width: 140,
      render: (budget: string) => budget ? (BUDGET_MAP[budget] || budget) : '-',
    },
    {
      title: '문의일시',
      dataIndex: 'regDt',
      key: 'regDt',
      width: 160,
      render: (dt: string) => dt ? dayjs(dt).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '메모',
      dataIndex: 'adminMemo',
      key: 'adminMemo',
      width: 80,
      align: 'center',
      render: (memo: string) => memo ? (
        <Tooltip title={memo}>
          <Badge dot color="blue">
            <EditOutlined style={{ fontSize: 16 }} />
          </Badge>
        </Tooltip>
      ) : (
        <span style={{ color: '#ccc' }}>-</span>
      ),
    },
    {
      title: '관리',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="상세보기">
            <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} />
          </Tooltip>
          <Tooltip title="상태변경">
            <Button size="small" icon={<SyncOutlined />} onClick={() => handleOpenStatusModal(record)} />
          </Tooltip>
          <Tooltip title="메모">
            <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenMemoModal(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const detail = detailData?.data || selectedInquiry;

  return (
    <div>
      {/* 상단 통계 카드 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="전체 문의"
              value={totalElements}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="대기중"
              value={pendingCount}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="처리중"
              value={inProgressCount}
              valueStyle={{ color: '#1890ff' }}
              prefix={<SyncOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="완료"
              value={completedCount}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 필터 */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>견적문의 관리</h2>
        <Space>
          <span>상태 필터:</span>
          <Select
            allowClear
            placeholder="전체"
            style={{ width: 140 }}
            value={filterStatus}
            onChange={(val) => { setFilterStatus(val); setCurrentPage(1); }}
          >
            <Select.Option value="PENDING">대기</Select.Option>
            <Select.Option value="IN_PROGRESS">처리중</Select.Option>
            <Select.Option value="COMPLETED">완료</Select.Option>
            <Select.Option value="CANCELLED">취소</Select.Option>
          </Select>
        </Space>
      </div>

      {/* 테이블 */}
      <div style={{ marginBottom: 8, color: '#666', fontSize: 14 }}>
        총 {totalElements}건 ({currentPage}/{Math.max(1, Math.ceil(totalElements / 10))} 페이지)
      </div>
      <Table
        columns={columns}
        dataSource={inquiries}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize: 10,
          total: totalElements,
          showSizeChanger: false,
          onChange: (page) => setCurrentPage(page),
        }}
        rowClassName={(record) => record.status === 'PENDING' ? 'inquiry-row-pending' : ''}
        size="middle"
      />

      {/* 상세 모달 */}
      <Modal
        title={
          <Space>
            <span>견적문의 상세</span>
            {detail && (
              <Tag
                icon={STATUS_MAP[detail.status]?.icon}
                color={STATUS_MAP[detail.status]?.color}
              >
                {STATUS_MAP[detail.status]?.label || detail.status}
              </Tag>
            )}
          </Space>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="status" onClick={() => { setDetailModalOpen(false); if (detail) handleOpenStatusModal(detail); }}>
            상태변경
          </Button>,
          <Button key="memo" onClick={() => { setDetailModalOpen(false); if (detail) handleOpenMemoModal(detail); }}>
            메모 작성
          </Button>,
          <Button key="close" type="primary" onClick={() => setDetailModalOpen(false)}>
            닫기
          </Button>,
        ]}
        width={700}
      >
        {detail && (
          <Descriptions bordered column={2} size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label={<Space><UserOutlined /> 이름</Space>}>
              <strong>{detail.name}</strong>
            </Descriptions.Item>
            <Descriptions.Item label={<Space><PhoneOutlined /> 연락처</Space>}>
              <a href={`tel:${detail.phone}`}>{detail.phone}</a>
            </Descriptions.Item>
            <Descriptions.Item label={<Space><MailOutlined /> 이메일</Space>} span={2}>
              {detail.email ? <a href={`mailto:${detail.email}`}>{detail.email}</a> : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="시공유형">
              <Tag color="blue">{TYPE_MAP[detail.inquiryType] || detail.inquiryType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="예상 예산">
              {detail.budget ? (BUDGET_MAP[detail.budget] || detail.budget) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={<Space><EnvironmentOutlined /> 시공 장소</Space>} span={2}>
              {detail.address || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="문의 내용" span={2}>
              <div style={{ whiteSpace: 'pre-wrap', minHeight: 60 }}>
                {detail.content}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="관리자 메모" span={2}>
              <div style={{ whiteSpace: 'pre-wrap', minHeight: 40, color: detail.adminMemo ? '#333' : '#ccc' }}>
                {detail.adminMemo || '메모 없음'}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="접수일시">
              {detail.regDt ? dayjs(detail.regDt).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="수정일시">
              {detail.modDt ? dayjs(detail.modDt).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 상태 변경 모달 */}
      <Modal
        title="상태 변경"
        open={statusModalOpen}
        onOk={() => {
          if (selectedInquiry) {
            statusMutation.mutate({ id: selectedInquiry.id, status: newStatus });
          }
        }}
        onCancel={() => setStatusModalOpen(false)}
        confirmLoading={statusMutation.isPending}
        okText="변경"
        cancelText="취소"
      >
        {selectedInquiry && (
          <div>
            <p style={{ marginBottom: 16 }}>
              <strong>{selectedInquiry.name}</strong>님의 문의 상태를 변경합니다.
            </p>
            <Select
              style={{ width: '100%' }}
              value={newStatus}
              onChange={(val) => setNewStatus(val)}
            >
              <Select.Option value="PENDING">
                <Space><ClockCircleOutlined style={{ color: '#fa8c16' }} /> 대기</Space>
              </Select.Option>
              <Select.Option value="IN_PROGRESS">
                <Space><SyncOutlined style={{ color: '#1890ff' }} /> 처리중</Space>
              </Select.Option>
              <Select.Option value="COMPLETED">
                <Space><CheckCircleOutlined style={{ color: '#52c41a' }} /> 완료</Space>
              </Select.Option>
              <Select.Option value="CANCELLED">
                <Space><CloseCircleOutlined style={{ color: '#999' }} /> 취소</Space>
              </Select.Option>
            </Select>
          </div>
        )}
      </Modal>

      {/* 메모 모달 */}
      <Modal
        title="관리자 메모"
        open={memoModalOpen}
        onOk={() => {
          if (selectedInquiry) {
            memoMutation.mutate({ id: selectedInquiry.id, memo: newMemo });
          }
        }}
        onCancel={() => setMemoModalOpen(false)}
        confirmLoading={memoMutation.isPending}
        okText="저장"
        cancelText="취소"
      >
        {selectedInquiry && (
          <div>
            <p style={{ marginBottom: 8 }}>
              <strong>{selectedInquiry.name}</strong>님의 문의에 대한 관리자 메모
            </p>
            <TextArea
              rows={5}
              value={newMemo}
              onChange={(e) => setNewMemo(e.target.value)}
              placeholder="처리 내용, 메모 등을 입력하세요"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InquiryManagement;
