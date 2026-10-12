import React, { useState } from 'react';
import { Form, Input, Select, Button, Result, message } from 'antd';
import { SendOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { publicInquiryApi } from '../../api/endpoints/public';
import './InquiryPage.css';

const { TextArea } = Input;

const InquiryPage: React.FC = () => {
  const [form] = Form.useForm();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: Record<string, string>) => {
    setLoading(true);
    try {
      await publicInquiryApi.create({
        name: values.name,
        phone: values.phone,
        email: values.email,
        type: values.type,
        budget: values.budget,
        address: values.address,
        content: values.content,
      });
      setSubmitted(true);
    } catch (error) {
      message.error('견적문의 접수에 실패했습니다. 다시 시도해주세요.');
      console.error('견적문의 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div>
        <div className="page-banner">
          <h1>견적문의</h1>
          <p>맞춤 인테리어 견적을 요청해 보세요</p>
        </div>
        <div className="page-container">
          <Result
            status="success"
            title="견적문의가 접수되었습니다!"
            subTitle="빠른 시일 내에 담당자가 연락드리겠습니다. 감사합니다."
            extra={
              <Button type="primary" onClick={() => { setSubmitted(false); form.resetFields(); }}>
                추가 문의하기
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-banner">
        <h1>견적문의</h1>
        <p>맞춤 인테리어 견적을 요청해 보세요</p>
      </div>
      <div className="page-container">
        <div className="inquiry-layout">
          {/* 문의 양식 */}
          <div className="inquiry-form-section">
            <h2>문의 양식</h2>
            <p className="inquiry-form-desc">아래 양식을 작성해 주시면 빠르게 견적을 안내드리겠습니다.</p>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
              size="large"
            >
              <div className="form-row">
                <Form.Item name="name" label="이름" rules={[{ required: true, message: '이름을 입력해주세요' }]}>
                  <Input placeholder="홍길동" />
                </Form.Item>
                <Form.Item name="phone" label="연락처" rules={[{ required: true, message: '연락처를 입력해주세요' }]}>
                  <Input placeholder="010-0000-0000" />
                </Form.Item>
              </div>
              <Form.Item name="email" label="이메일">
                <Input placeholder="example@email.com" />
              </Form.Item>
              <div className="form-row">
                <Form.Item name="type" label="시공 유형" rules={[{ required: true, message: '시공 유형을 선택해주세요' }]}>
                  <Select placeholder="선택해주세요">
                    <Select.Option value="apartment">아파트</Select.Option>
                    <Select.Option value="villa">빌라</Select.Option>
                    <Select.Option value="office">사무실</Select.Option>
                    <Select.Option value="store">상가</Select.Option>
                    <Select.Option value="other">기타</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="budget" label="예상 예산">
                  <Select placeholder="선택해주세요">
                    <Select.Option value="under1000">1,000만원 이하</Select.Option>
                    <Select.Option value="1000-3000">1,000 ~ 3,000만원</Select.Option>
                    <Select.Option value="3000-5000">3,000 ~ 5,000만원</Select.Option>
                    <Select.Option value="over5000">5,000만원 이상</Select.Option>
                    <Select.Option value="consult">상담 후 결정</Select.Option>
                  </Select>
                </Form.Item>
              </div>
              <Form.Item name="address" label="시공 장소">
                <Input placeholder="시공 예정 장소 주소" />
              </Form.Item>
              <Form.Item
                name="content"
                label="문의 내용"
                rules={[{ required: true, message: '문의 내용을 입력해주세요' }]}
              >
                <TextArea
                  rows={5}
                  placeholder="원하시는 인테리어 스타일, 시공 범위, 일정 등을 자유롭게 작성해 주세요."
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SendOutlined />}
                  loading={loading}
                  block
                  size="large"
                >
                  견적 요청하기
                </Button>
              </Form.Item>
            </Form>
          </div>

          {/* 연락처 정보 */}
          <div className="inquiry-info-section">
            <h2>Contact</h2>
            <div className="info-cards">
              <div className="info-card">
                <PhoneOutlined className="info-icon" />
                <div>
                  <strong>전화 상담</strong>
                  <p>02-000-0000</p>
                  <p className="info-sub">평일 09:00 ~ 18:00</p>
                </div>
              </div>
              <div className="info-card">
                <MailOutlined className="info-icon" />
                <div>
                  <strong>이메일</strong>
                  <p>info@sudesign.co.kr</p>
                </div>
              </div>
              <div className="info-card">
                <EnvironmentOutlined className="info-icon" />
                <div>
                  <strong>오시는 길</strong>
                  <p>서울특별시 강남구<br />테헤란로 000, 0층</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryPage;
