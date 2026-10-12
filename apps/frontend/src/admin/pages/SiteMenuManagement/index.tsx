import React, { useMemo } from 'react';
import { Table, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { menuApi, MenuType, type MenuResponse } from '@/shared/api/endpoints/menu';
import PageHeader from '@/admin/components/PageHeader';
import { buildSiteMenuColumns } from './siteMenuColumns';

/** 트리를 표시 순서 그대로 펼친다 (부모 바로 아래 자식). children 은 떼어 낸다 — 두면 antd Table 이 트리 확장 아이콘을 그린다. */
const flatten = (menus: MenuResponse[]): MenuResponse[] =>
  menus.flatMap((m) => [{ ...m, children: undefined }, ...flatten(m.children ?? [])]);

/**
 * 홈페이지 메뉴 — 운영자(형)용. 켜기/끄기와 순서만 다룬다.
 * 새 메뉴 추가·주소 변경은 시스템 관리 › 메뉴 관리(사용자 메뉴 탭)에서 개발자가 한다.
 * 바꾸면 홈페이지 헤더(`['site-menus']`)가 바로 다시 읽는다.
 */
const SiteMenuManagement: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['menus', MenuType.USER, true],
    queryFn: async () => (await menuApi.getMenusByType(MenuType.USER, true)).data,
  });
  const rows = useMemo(() => (data ? flatten(data) : []), [data]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['menus'] });
    queryClient.invalidateQueries({ queryKey: ['site-menus'] });
  };

  const toggleMutation = useMutation({
    mutationFn: ({ id, on }: { id: number; on: boolean }) => (on ? menuApi.activateMenu(id) : menuApi.deactivateMenu(id)),
    onSuccess: (_result, { on }) => {
      message.success(on ? '홈페이지에 표시됩니다.' : '홈페이지에서 숨겼습니다.');
      refresh();
    },
    onError: () => message.error('저장하지 못했습니다. 다시 시도해 주세요.'),
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, direction }: { id: number; direction: 'up' | 'down' }) => menuApi.moveMenu(id, direction),
    onSuccess: refresh,
    onError: () => message.error('순서를 바꾸지 못했습니다. 다시 시도해 주세요.'),
  });

  const busy = toggleMutation.isPending || moveMutation.isPending;
  const columns = buildSiteMenuColumns({
    rows,
    busy,
    onToggle: (id, on) => toggleMutation.mutate({ id, on }),
    onMove: (id, direction) => moveMutation.mutate({ id, direction }),
  });

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="홈페이지 메뉴"
        description="홈페이지 위쪽 메뉴를 켜고 끄거나 순서를 바꿉니다. 바꾸면 홈페이지에 바로 반영됩니다. 새 메뉴 추가나 주소 변경은 개발자에게 요청하세요."
      />
      <Table
        scroll={{ x: 'max-content' }} bordered rowKey="id" columns={columns} dataSource={rows} loading={isLoading} pagination={false} />
    </div>
  );
};

export default SiteMenuManagement;
