import React, { useState } from 'react';
import { Card, Col, Row, Select, Space, Statistic, Table, message } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inquiryApi, InquiryResponse } from '@/shared/api/endpoints/inquiry';
import PageHeader from '@/admin/components/PageHeader';
import ListSummary from '@/admin/components/ListSummary';
import { buildInquiryColumns } from './inquiryColumns';
import InquiryDetailModal from './InquiryDetailModal';
import InquiryStatusModal from './InquiryStatusModal';
import InquiryMemoModal from './InquiryMemoModal';

const PAGE_SIZE = 10;

/**
 * 견적문의 관리 — 상태별 집계·상태 필터·상세·상태 변경·관리자 메모
 */
const InquiryManagement: React.FC = () => {
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [memoOpen, setMemoOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryResponse | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  /** 1부터 시작하는 현재 페이지 */
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  // 목록 조회
  const { data, isLoading } = useQuery({
    queryKey: ['inquiries', currentPage, filterStatus],
    queryFn: () => inquiryApi.getAll(currentPage - 1, PAGE_SIZE, filterStatus),
  });

  // 상세 조회
  const { data: detailData } = useQuery({
    queryKey: ['inquiry', selectedInquiry?.id],
    queryFn: () => inquiryApi.getById(selectedInquiry!.id),
    enabled: !!selectedInquiry?.id && detailOpen,
  });

  // 상태 변경
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      inquiryApi.updateStatus(id, status),
    onSuccess: () => {
      message.success('상태가 변경되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['inquiry'] });
      setStatusOpen(false);
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
      setMemoOpen(false);
    },
    onError: () => message.error('메모 저장에 실패했습니다.'),
  });

  const inquiries = data?.data?.content || [];
  const totalElements = data?.data?.totalElements || 0;

  // 통계 계산 (현재 페이지에 보이는 건 기준)
  const pendingCount = inquiries.filter((i) => i.status === 'PENDING').length;
  const inProgressCount = inquiries.filter((i) => i.status === 'IN_PROGRESS').length;
  const completedCount = inquiries.filter((i) => i.status === 'COMPLETED').length;

  // 상세보기
  const openDetail = (record: InquiryResponse) => {
    setSelectedInquiry(record);
    setDetailOpen(true);
  };

  // 상태 변경 모달
  const openStatus = (record: InquiryResponse) => {
    setSelectedInquiry(record);
    setStatusOpen(true);
  };

  // 메모 모달
  const openMemo = (record: InquiryResponse) => {
    setSelectedInquiry(record);
    setMemoOpen(true);
  };

  const columns = buildInquiryColumns({
    total: totalElements,
    currentPage,
    pageSize: PAGE_SIZE,
    onDetail: openDetail,
    onChangeStatus: openStatus,
    onEditMemo: openMemo,
  });

  // 상세 모달은 단건 조회 결과를 우선 쓰고, 아직 없으면 목록의 행을 보여 준다
  const detail = detailData?.data || selectedInquiry;

  return (
    <div>
      <PageHeader
        title="견적문의 관리"
        extra={
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
        }
      />

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

      <ListSummary total={totalElements} page={currentPage - 1} pageSize={PAGE_SIZE} />
      <Table
        columns={columns}
        dataSource={inquiries}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize: PAGE_SIZE,
          total: totalElements,
          showSizeChanger: false,
          onChange: (page) => setCurrentPage(page),
        }}
        rowClassName={(record) => record.status === 'PENDING' ? 'inquiry-row-pending' : ''}
        size="middle"
      />

      <InquiryDetailModal
        open={detailOpen}
        inquiry={detail}
        onClose={() => setDetailOpen(false)}
        onChangeStatus={openStatus}
        onEditMemo={openMemo}
      />
      <InquiryStatusModal
        open={statusOpen}
        inquiry={selectedInquiry}
        loading={statusMutation.isPending}
        onSubmit={(status) => {
          if (selectedInquiry) statusMutation.mutate({ id: selectedInquiry.id, status });
        }}
        onCancel={() => setStatusOpen(false)}
      />
      <InquiryMemoModal
        open={memoOpen}
        inquiry={selectedInquiry}
        loading={memoMutation.isPending}
        onSubmit={(memo) => {
          if (selectedInquiry) memoMutation.mutate({ id: selectedInquiry.id, memo });
        }}
        onCancel={() => setMemoOpen(false)}
      />
    </div>
  );
};

export default InquiryManagement;
