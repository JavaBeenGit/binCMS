import { Button, Space, Switch, Tag, Tooltip } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuResponse } from '@/shared/api/endpoints/menu';

interface SiteMenuColumnHandlers {
  /** 트리를 펼친 전체 행 — 형제 범위(같은 부모) 안에서 처음/끝 판단에 쓴다 */
  rows: MenuResponse[];
  busy: boolean;
  onToggle: (id: number, on: boolean) => void;
  onMove: (id: number, direction: 'up' | 'down') => void;
}

const centerHeader = () => ({ style: { textAlign: 'center' as const } });

export function buildSiteMenuColumns(h: SiteMenuColumnHandlers): ColumnsType<MenuResponse> {
  const siblingsOf = (m: MenuResponse) => h.rows.filter((r) => (r.parentId ?? null) === (m.parentId ?? null));

  return [
    {
      title: '메뉴',
      dataIndex: 'menuName',
      key: 'menuName',
      onHeaderCell: centerHeader,
      render: (text: string, record) => (
        <span style={{ marginLeft: `${(record.depth - 1) * 20}px`, fontWeight: record.depth === 1 ? 600 : 400 }}>
          {record.depth > 1 && '└ '}
          {text}
          {!record.menuUrl && <Tag style={{ marginLeft: 8 }}>묶음</Tag>}
        </span>
      ),
    },
    {
      title: '홈페이지 주소',
      dataIndex: 'menuUrl',
      key: 'menuUrl',
      ellipsis: true,
      onHeaderCell: centerHeader,
      render: (url?: string) => url || <span style={{ color: '#999' }}>하위 메뉴를 펼치는 묶음</span>,
    },
    {
      title: '홈페이지에 표시',
      dataIndex: 'useYn',
      key: 'useYn',
      width: 150,
      align: 'center',
      render: (useYn: string, record) => (
        <Switch
          checked={useYn === 'Y'}
          checkedChildren="표시"
          unCheckedChildren="숨김"
          disabled={h.busy}
          onChange={(on) => h.onToggle(record.id, on)}
        />
      ),
    },
    {
      title: '순서',
      key: 'order',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const siblings = siblingsOf(record);
        const idx = siblings.findIndex((s) => s.id === record.id);
        return (
          <Space size="small">
            <Tooltip title="위로">
              <Button size="small" icon={<ArrowUpOutlined />} disabled={h.busy || idx <= 0} onClick={() => h.onMove(record.id, 'up')} />
            </Tooltip>
            <Tooltip title="아래로">
              <Button
                size="small"
                icon={<ArrowDownOutlined />}
                disabled={h.busy || idx < 0 || idx >= siblings.length - 1}
                onClick={() => h.onMove(record.id, 'down')}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];
}
