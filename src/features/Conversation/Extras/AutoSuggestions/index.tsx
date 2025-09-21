import { Tag } from 'antd';
import { createStyles } from 'antd-style';
import { MessageCircle } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { ChatAutoSuggestions, ChatSuggestion } from '@/types/message';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    margin-top: 8px;
  `,
  header: css`
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
    color: ${token.colorTextSecondary};
    font-size: 12px;
    font-weight: 500;
  `,
  icon: css`
    color: ${token.colorTextTertiary};
  `,
  suggestion: css`
    cursor: pointer;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;
    padding: 6px 12px;
    background: ${token.colorBgContainer};
    color: ${token.colorText};
    font-size: 13px;
    line-height: 1.4;
    transition: all 0.2s ease;

    &:hover {
      border-color: ${token.colorPrimary};
      background: ${token.colorPrimaryBg};
      color: ${token.colorPrimary};
    }
  `,
  suggestions: css`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  `,
}));

interface AutoSuggestionsProps extends ChatAutoSuggestions {
  id: string;
}

export const AutoSuggestions = memo<AutoSuggestionsProps>(({ id, suggestions, loading }) => {
  const { t } = useTranslation('chat');
  const { styles } = useStyles();
  const [sendMessage] = useChatStore((s) => [s.sendMessage]);

  const handleSuggestionClick = (suggestion: ChatSuggestion) => {
    sendMessage(suggestion.text);
  };

  if (loading) {
    return (
      <Flexbox className={styles.container}>
        <div className={styles.header}>
          <MessageCircle className={styles.icon} size={12} />
          {t('autoSuggestions.generating', { ns: 'chat' })}
        </div>
      </Flexbox>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Flexbox className={styles.container}>
      <div className={styles.header}>
        <MessageCircle className={styles.icon} size={12} />
        {t('autoSuggestions.title', { ns: 'chat' })}
      </div>
      <div className={styles.suggestions}>
        {suggestions.map((suggestion, index) => (
          <Tag
            key={suggestion.id || index}
            className={styles.suggestion}
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion.text}
          </Tag>
        ))}
      </div>
    </Flexbox>
  );
});

export default AutoSuggestions;