'use client';

import { ActionIcon, Dropdown, Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Bot, SquarePlus, Users } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ProductLogo } from '@/components/Branding';
import { ChatGroupWizard } from '@/components/ChatGroupWizard';
import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useActionSWR } from '@/libs/swr';
import { useChatGroupStore } from '@/store/chatGroup';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';

import TogglePanelButton from '../../../features/TogglePanelButton';
import SessionSearchBar from '../../features/SessionSearchBar';

export const useStyles = createStyles(({ css, token }) => ({
  logo: css`
    color: ${token.colorText};
    fill: ${token.colorText};
  `,
  top: css`
    position: sticky;
    inset-block-start: 0;
    padding-block-start: 10px;
  `,
}));

const Header = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('chat');
  const [createSession] = useSessionStore((s) => [s.createSession]);
  const [createGroup] = useChatGroupStore((s) => [s.createGroup]);
  const { showCreateSession, enableGroupChat } = useServerConfigStore(featureFlagsSelectors);
  const [isGroupWizardOpen, setIsGroupWizardOpen] = useState(false);

  // We need pass inital member list so we cannot use mutate
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const { mutate: mutateAgent, isValidating: isValidatingAgent } = useActionSWR(
    'session.createSession',
    () => createSession(),
  );

  const handleCreateGroupFromTemplate = async (templateId: string) => {
    setIsGroupWizardOpen(false);
    setIsCreatingGroup(true);
    try {
      // TODO: Implement template-based group creation
      console.log('Creating group from template:', templateId);
      await createGroup(
        {
          title: t('defaultGroupChat'),
        },
        [], // Empty for now, will be filled when template logic is implemented
      );
    } catch (error) {
      console.error('Failed to create group from template:', error);
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleCreateGroupWithMembers = async (selectedAgents: string[]) => {
    setIsGroupWizardOpen(false);
    setIsCreatingGroup(true);
    try {
      await createGroup(
        {
          title: t('defaultGroupChat'),
        },
        selectedAgents,
      );
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleGroupWizardCancel = () => {
    setIsGroupWizardOpen(false);
  };

  return (
    <Flexbox className={styles.top} gap={16} paddingInline={8}>
      <Flexbox align={'flex-start'} horizontal justify={'space-between'}>
        <Flexbox
          align={'center'}
          gap={4}
          horizontal
          style={{
            paddingInlineStart: 4,
            paddingTop: 2,
          }}
        >
          <ProductLogo className={styles.logo} size={36} type={'text'} />
        </Flexbox>
        <Flexbox align={'center'} gap={4} horizontal>
          <TogglePanelButton />
          {showCreateSession && (
            <Dropdown
              menu={{
                items: [
                  {
                    icon: <Icon icon={Bot} />,
                    key: 'newAgent',
                    label: t('newAgent'),
                    onClick: () => {
                      mutateAgent();
                    },
                  },
                  ...(enableGroupChat
                    ? [
                        {
                          icon: <Icon icon={Users} />,
                          key: 'newGroup',
                          label: t('newGroupChat'),
                          onClick: () => {
                            setIsGroupWizardOpen(true);
                          },
                        },
                      ]
                    : []),
                ],
              }}
              trigger={['hover']}
            >
              <ActionIcon
                icon={SquarePlus}
                loading={isValidatingAgent || isCreatingGroup}
                size={DESKTOP_HEADER_ICON_SIZE}
                style={{ flex: 'none' }}
              />
            </Dropdown>
          )}
        </Flexbox>
      </Flexbox>
      <SessionSearchBar />

      {enableGroupChat && (
        <ChatGroupWizard
          onCancel={handleGroupWizardCancel}
          onCreateCustom={handleCreateGroupWithMembers}
          onCreateFromTemplate={handleCreateGroupFromTemplate}
          open={isGroupWizardOpen}
        />
      )}
    </Flexbox>
  );
});

export default Header;
