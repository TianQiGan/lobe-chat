'use client';

import { ActionIcon, Avatar, GroupAvatar, List, Modal, SearchBar, Text } from '@lobehub/ui';
import { Button, Checkbox, Empty } from 'antd';
import { createStyles } from 'antd-style';
import { Users, X } from 'lucide-react';
import { type ChangeEvent, memo, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { MemberSelectionModal } from '@/components/MemberSelectionModal';
import { DEFAULT_AVATAR } from '@/const/meta';

import { useGroupTemplates } from './templates';

const TemplateItem = memo<{
  cx: any;
  isSelected: boolean;
  onToggle: (templateId: string) => void;
  styles: any;
  t: any;
  template: any;
}>(({ template, isSelected, onToggle, styles, cx, t }) => {
  const ref = useRef(null);

  return (
    <div className={cx(styles.listItem)} onClick={() => onToggle(template.id)} ref={ref}>
      <Flexbox align="center" gap={12} horizontal width="100%">
        <Checkbox
          checked={isSelected}
          onChange={() => onToggle(template.id)}
          onClick={(e) => e.stopPropagation()}
        />
        <GroupAvatar
          avatars={template.members.map((member: any) => ({
            avatar: member.avatar || DEFAULT_AVATAR,
            background: member.backgroundColor || undefined,
          }))}
          size={40}
        />
        <Flexbox flex={1} gap={2}>
          <Text className={styles.title}>{template.title}</Text>
          <Text className={styles.description} ellipsis>
            {template.description}
          </Text>
          <Flexbox align="center" gap={4} horizontal>
            <Users size={11} style={{ color: '#999' }} />
            <Text style={{ fontSize: 11 }} type="secondary">
              {t('groupWizard.memberCount', {
                count: template.members.length,
              })}
            </Text>
          </Flexbox>
        </Flexbox>
      </Flexbox>
    </div>
  );
});

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    display: flex;
    flex-direction: row;
    height: 500px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;
  `,
  description: css`
    color: ${token.colorTextSecondary};
    font-size: 11px;
    line-height: 1.2;
  `,
  leftColumn: css`
    flex: 1;
    overflow-y: auto;
    border-right: 1px solid ${token.colorBorderSecondary};
    padding: ${token.paddingSM}px ${token.paddingSM}px 0 ${token.paddingSM}px;
    user-select: none;
  `,
  listItem: css`
    position: relative;
    margin-block: 2px;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: ${token.paddingSM}px !important;
    border-radius: ${token.borderRadius}px;

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,
  rightColumn: css`
    flex: 1;
    overflow-y: auto;
    padding: ${token.paddingSM}px;
    display: flex;
    flex-direction: column;
  `,
  templateCard: css`
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid ${token.colorBorderSecondary};

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,
  templateList: css`
    flex: 1;
    overflow-y: auto;
    padding: ${token.paddingSM}px;
  `,
  title: css`
    font-weight: 500;
    font-size: 14px;
  `,
}));

export interface ChatGroupWizardProps {
  /**
   * External loading state for template creation (controlled by parent)
   */
  isCreatingFromTemplate?: boolean;
  onCancel: () => void;
  onCreateCustom: (selectedAgents: string[]) => void | Promise<void>;
  onCreateFromTemplate: (templateId: string) => void | Promise<void>;
  open: boolean;
}

const ChatGroupWizard = memo<ChatGroupWizardProps>(
  ({
    onCancel,
    onCreateFromTemplate,
    onCreateCustom,
    open,
    isCreatingFromTemplate: externalLoading,
  }) => {
    const { t } = useTranslation(['chat', 'common']);
    const { styles, cx } = useStyles();
    const groupTemplates = useGroupTemplates();
    const [isMemberSelectionOpen, setIsMemberSelectionOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [removedMembers, setRemovedMembers] = useState<Record<string, string[]>>({});

    // Use external loading state if provided, otherwise use internal state
    const isCreatingFromTemplate = externalLoading ?? false;

    const handleTemplateToggle = (templateId: string) => {
      setSelectedTemplate((prev) => (prev === templateId ? '' : templateId));
    };

    const handleReset = () => {
      setSelectedTemplate('');
      setSearchTerm('');
      setRemovedMembers({});
    };

    const handleRemoveMember = useCallback((templateId: string, memberTitle: string) => {
      setRemovedMembers((prev) => ({
        ...prev,
        [templateId]: [...(prev[templateId] || []), memberTitle],
      }));
    }, []);

    const handleTemplateConfirm = async () => {
      if (!selectedTemplate) return;

      // If using external loading state, don't manage loading internally
      if (externalLoading !== undefined) {
        await onCreateFromTemplate(selectedTemplate);
        // Reset will be handled by parent after successful creation
        handleReset();
      } else {
        // Fallback for backwards compatibility
        try {
          await onCreateFromTemplate(selectedTemplate);
          handleReset();
        } catch (error) {
          console.error('Failed to create group from template:', error);
        }
      }
    };

    const handleCustomCreate = () => {
      onCancel(); // Close the wizard modal first
      // Use setTimeout to ensure modal close animation completes before opening new modal
      setTimeout(() => {
        setIsMemberSelectionOpen(true);
      }, 100);
    };

    const handleMemberSelectionCancel = () => {
      setIsMemberSelectionOpen(false);
    };

    const handleMemberSelectionConfirm = async (selectedAgents: string[]) => {
      setIsMemberSelectionOpen(false);
      await onCreateCustom(selectedAgents);
    };

    const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    }, []);

    // Filter templates based on search term
    const filteredTemplates = useMemo(() => {
      if (!searchTerm.trim()) return groupTemplates;

      return groupTemplates.filter((template) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          template.title.toLowerCase().includes(searchLower) ||
          template.description.toLowerCase().includes(searchLower)
        );
      });
    }, [searchTerm]);

    const selectedTemplateMembers = useMemo(() => {
      if (!selectedTemplate) return [];

      const template = groupTemplates.find((t) => t.id === selectedTemplate);
      if (!template) return [];

      const removedForTemplate = removedMembers[selectedTemplate] || [];

      return template.members
        .filter((member) => !removedForTemplate.includes(member.title))
        .map((member) => ({
          avatar: member.avatar || DEFAULT_AVATAR,
          backgroundColor: member.backgroundColor,
          description: template.title,
          key: `${selectedTemplate}-${member.title}`,
          title: member.title,
        }));
    }, [selectedTemplate, removedMembers, groupTemplates]);

    const handleCancel = () => {
      handleReset();
      onCancel();
    };

    return (
      <>
        <Modal
          footer={
            <Flexbox gap={8} horizontal justify="space-between">
              <Button onClick={handleCustomCreate} type="default">
                {t('groupWizard.chooseMembers')}
              </Button>
              <Flexbox gap={8} horizontal>
                <Button onClick={handleCancel}>{t('cancel', { ns: 'common' })}</Button>
                <Button
                  disabled={!selectedTemplate}
                  loading={isCreatingFromTemplate}
                  onClick={handleTemplateConfirm}
                  type="primary"
                >
                  {t('groupWizard.createGroup')}
                </Button>
              </Flexbox>
            </Flexbox>
          }
          onCancel={handleCancel}
          open={open}
          title={t('groupWizard.title')}
          width={800}
        >
          <Flexbox className={styles.container} horizontal>
            {/* Left Column - Templates */}
            <Flexbox className={styles.leftColumn} flex={1} gap={12}>
              <SearchBar
                allowClear
                onChange={handleSearchChange}
                placeholder={t('groupWizard.searchTemplates')}
                value={searchTerm}
                variant="filled"
              />

              <Flexbox flex={1} style={{ overflowY: 'auto' }}>
                {filteredTemplates.length === 0 ? (
                  <Empty
                    description={
                      searchTerm
                        ? t('groupWizard.noMatchingTemplates')
                        : t('groupWizard.noTemplates')
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <div>
                    {filteredTemplates.map((template) => {
                      const isSelected = selectedTemplate === template.id;

                      return (
                        <TemplateItem
                          cx={cx}
                          isSelected={isSelected}
                          key={template.id}
                          onToggle={handleTemplateToggle}
                          styles={styles}
                          t={t}
                          template={template}
                        />
                      );
                    })}
                  </div>
                )}
              </Flexbox>
            </Flexbox>

            {/* Right Column - Group Members */}
            <Flexbox className={styles.rightColumn} flex={1}>
              {selectedTemplateMembers.length === 0 ? (
                <Flexbox align="center" flex={1} justify="center">
                  <Empty
                    description={t('groupWizard.noSelectedTemplates')}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </Flexbox>
              ) : (
                <Flexbox flex={1} style={{ overflowY: 'auto' }}>
                  <Text style={{ marginBottom: 16 }} type="secondary">
                    {t('groupWizard.groupMembers')}
                  </Text>
                  <List
                    items={selectedTemplateMembers.map((member) => ({
                      actions: (
                        <ActionIcon
                          icon={X}
                          onClick={() => handleRemoveMember(selectedTemplate, member.title)}
                          size="small"
                          style={{ color: '#999' }}
                        />
                      ),
                      avatar: (
                        <Avatar
                          avatar={member.avatar}
                          background={member.backgroundColor}
                          shape="circle"
                          size={40}
                        />
                      ),
                      description: member.description,
                      key: member.key,
                      showAction: true,
                      title: member.title,
                    }))}
                  />
                </Flexbox>
              )}
            </Flexbox>
          </Flexbox>
        </Modal>

        <MemberSelectionModal
          mode="create"
          onCancel={handleMemberSelectionCancel}
          onConfirm={handleMemberSelectionConfirm}
          open={isMemberSelectionOpen}
        />
      </>
    );
  },
);

export default ChatGroupWizard;
