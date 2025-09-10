'use client';

import { GroupAvatar, List, SearchBar, Text } from '@lobehub/ui';
import { Button, Card, Checkbox, Empty, Modal, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { Users } from 'lucide-react';
import { type ChangeEvent, memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { MemberSelectionModal } from '@/components/MemberSelectionModal';
import { DEFAULT_AVATAR } from '@/const/meta';

const { Title } = Typography;

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    display: flex;
    flex-direction: row;
    height: 500px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;
    position: relative;
  `,
  customIcon: css`
    font-size: 48px;
    color: ${token.colorPrimary};
    margin-bottom: ${token.marginMD}px;
  `,
  divider: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-75%, -50%);
    background: ${token.colorBgContainer};
    padding: ${token.paddingXS}px ${token.paddingSM}px;
    font-size: ${token.fontSizeSM}px;
    font-weight: 500;
    color: ${token.colorTextSecondary};
    z-index: 1;
  `,
  leftColumn: css`
    flex: 1;
    overflow-y: auto;
    border-right: 1px solid ${token.colorBorderSecondary};
    padding: ${token.paddingSM}px;
    display: flex;
    flex-direction: column;
    user-select: none;
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
      border-color: ${token.colorPrimary};
      box-shadow: 0 2px 8px ${token.colorPrimary}20;
    }
  `,
  templateList: css`
    flex: 1;
    overflow-y: auto;
    padding: 0;
  `,
}));

interface GroupTemplate {
  description: string;
  id: string;
  members: Array<{
    avatar: string;
    backgroundColor?: string;
    title: string;
  }>;
  title: string;
}

const groupTemplates: GroupTemplate[] = [
  {
    description: 'Creative thinking with diverse perspectives',
    id: 'brainstorm',
    members: [
      {
        avatar: '🧠',
        backgroundColor: '#E8F5FF',
        title: 'Creative Director',
      },
      {
        avatar: '💡',
        backgroundColor: '#FFF7E8',
        title: 'Innovation Specialist',
      },
      {
        avatar: '🎨',
        backgroundColor: '#F6E8FF',
        title: 'Design Thinker',
      },
    ],
    title: 'Brainstorming Team',
  },
  {
    description: 'Data analysis and research team',
    id: 'analysis',
    members: [
      {
        avatar: '📊',
        backgroundColor: '#E8F8F5',
        title: 'Data Analyst',
      },
      {
        avatar: '🔍',
        backgroundColor: '#E8F5FF',
        title: 'Research Specialist',
      },
      {
        avatar: '📈',
        backgroundColor: '#FFF7E8',
        title: 'Statistics Expert',
      },
      {
        avatar: '🧮',
        backgroundColor: '#F0F8FF',
        title: 'Quantitative Analyst',
      },
    ],
    title: 'Analysis Squad',
  },
  {
    description: 'Content creation and editing team',
    id: 'writing',
    members: [
      {
        avatar: '✍️',
        backgroundColor: '#F6E8FF',
        title: 'Content Writer',
      },
      {
        avatar: '📝',
        backgroundColor: '#E8F8F5',
        title: 'Editor',
      },
    ],
    title: 'Writing Circle',
  },
  {
    description: 'Strategic planning and project management',
    id: 'planning',
    members: [
      {
        avatar: '📋',
        backgroundColor: '#E8F5FF',
        title: 'Project Manager',
      },
      {
        avatar: '🎯',
        backgroundColor: '#FFF7E8',
        title: 'Strategy Lead',
      },
      {
        avatar: '📅',
        backgroundColor: '#F0F8FF',
        title: 'Planning Coordinator',
      },
    ],
    title: 'Planning Committee',
  },
];

export interface ChatGroupWizardProps {
  onCancel: () => void;
  onCreateCustom: (selectedAgents: string[]) => void | Promise<void>;
  onCreateFromTemplate: (templateId: string) => void | Promise<void>;
  open: boolean;
}

const ChatGroupWizard = memo<ChatGroupWizardProps>(
  ({ onCancel, onCreateFromTemplate, onCreateCustom, open }) => {
    const { t } = useTranslation(['chat', 'common']);
    const { styles } = useStyles();
    const [isMemberSelectionOpen, setIsMemberSelectionOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [isCreatingFromTemplate, setIsCreatingFromTemplate] = useState(false);

    const handleTemplateToggle = (templateId: string) => {
      setSelectedTemplate((prev) => (prev === templateId ? '' : templateId));
    };

    const handleTemplateConfirm = async () => {
      if (!selectedTemplate) return;

      setIsCreatingFromTemplate(true);
      try {
        await onCreateFromTemplate(selectedTemplate);
        handleReset();
      } catch (error) {
        console.error('Failed to create group from template:', error);
      } finally {
        setIsCreatingFromTemplate(false);
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

      return template.members.map((member) => ({
        avatar: member.avatar || DEFAULT_AVATAR,
        backgroundColor: member.backgroundColor,
        description: template.title,
        key: `${selectedTemplate}-${member.title}`,
        title: member.title,
      }));
    }, [selectedTemplate]);

    const handleReset = () => {
      setSelectedTemplate('');
      setSearchTerm('');
    };

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
                {t('groupWizard.chooseMembers', { defaultValue: 'Choose Existing Assistants...' })}
              </Button>
              <Flexbox gap={8} horizontal>
                <Button onClick={handleCancel}>{t('cancel', { ns: 'common' })}</Button>
                <Button
                  disabled={!selectedTemplate}
                  loading={isCreatingFromTemplate}
                  onClick={handleTemplateConfirm}
                  type="primary"
                >
                  {t('groupWizard.createGroup', {
                    defaultValue: 'Create Group',
                  })}
                </Button>
              </Flexbox>
            </Flexbox>
          }
          onCancel={handleCancel}
          open={open}
          title={t('groupWizard.title', { defaultValue: 'Create Group Chat' })}
          width={900}
        >
          <Flexbox className={styles.container} horizontal>
            {/* Left Column - Templates */}
            <Flexbox className={styles.leftColumn}>
              <SearchBar
                allowClear
                onChange={handleSearchChange}
                placeholder={t('groupWizard.searchTemplates', {
                  defaultValue: 'Search template...',
                })}
                style={{ marginBottom: 12 }}
                value={searchTerm}
                variant="filled"
              />

              <div className={styles.templateList}>
                {filteredTemplates.length === 0 ? (
                  <Empty
                    description={
                      searchTerm
                        ? t('groupWizard.noMatchingTemplates', {
                            defaultValue: 'No matching templates',
                          })
                        : t('groupWizard.noTemplates', { defaultValue: 'No templates available' })
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <Flexbox gap={12}>
                    {filteredTemplates.map((template) => {
                      const isSelected = selectedTemplate === template.id;

                      return (
                        <Card
                          className={styles.templateCard}
                          hoverable
                          key={template.id}
                          onClick={() => handleTemplateToggle(template.id)}
                          size="small"
                        >
                          <Flexbox align="center" gap={12} horizontal>
                            <GroupAvatar
                              avatars={template.members.map((member) => ({
                                avatar: member.avatar || DEFAULT_AVATAR,
                                background: member.backgroundColor || undefined,
                              }))}
                              size={40}
                            />
                            <Flexbox flex={1}>
                              <Text strong>{template.title}</Text>
                              <Text style={{ fontSize: 12 }} type="secondary">
                                {template.description}
                              </Text>
                              <Flexbox align="center" gap={4} horizontal>
                                <Users size={11} style={{ color: '#999' }} />
                                <Text style={{ fontSize: 11 }} type="secondary">
                                  {t('groupWizard.memberCount', {
                                    count: template.members.length,
                                    defaultValue: '{{count}} members',
                                  })}
                                </Text>
                              </Flexbox>
                            </Flexbox>
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleTemplateToggle(template.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Flexbox>
                        </Card>
                      );
                    })}
                  </Flexbox>
                )}
              </div>
            </Flexbox>

            {/* Right Column - Group Members */}
            <Flexbox className={styles.rightColumn}>
              {selectedTemplateMembers.length === 0 ? (
                <Flexbox align="center" flex={1} justify="center">
                  <Empty
                    description={t('groupWizard.noSelectedTemplates', {
                      defaultValue: 'No templates selected',
                    })}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </Flexbox>
              ) : (
                <Flexbox flex={1} style={{ overflowY: 'auto' }}>
                  <Text style={{ marginBottom: 16 }} type="secondary">
                    {t('groupWizard.groupMembers', {
                      defaultValue: 'These assistants will also added to your list',
                    })}
                  </Text>
                  <List
                    items={selectedTemplateMembers.map((member) => ({
                      avatar: (
                        <div
                          style={{
                            alignItems: 'center',
                            backgroundColor: member.backgroundColor || '#f0f0f0',
                            borderRadius: '50%',
                            display: 'flex',
                            fontSize: 16,
                            height: 32,
                            justifyContent: 'center',
                            width: 32,
                          }}
                        >
                          {member.avatar}
                        </div>
                      ),
                      description: member.description,
                      key: member.key,
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
