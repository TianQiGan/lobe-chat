import { Collapse, Text } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { CheckCircle, Circle } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { SupervisorTodoItem } from '@/store/chat/slices/message/supervisor';

export interface TodoData {
  timestamp: number;
  todos: SupervisorTodoItem[];
  type: 'supervisor_todo';
}

export interface TodoListProps {
  data: TodoData;
}

const TodoList = memo<TodoListProps>(({ data }) => {
  const { t } = useTranslation('chat');
  const theme = useTheme();

  const { todos } = data;
  const completedCount = todos.filter((todo) => todo.finished).length;
  const totalCount = todos.length;

  // Create the header with progress indicator
  const headerContent = (
    <Flexbox align="center" gap={8} horizontal width="200px">
      <Text>
        {t('supervisor.todoList.title')}
        {completedCount}/{totalCount}
      </Text>
    </Flexbox>
  );

  // Create todo items content
  const todoItems =
    todos.length === 0 ? (
      <Flexbox align="center" gap={8} horizontal padding="8px 0">
        <CheckCircle color={theme.colorSuccess} size={16} />
        <span
          style={{
            color: theme.colorTextSecondary,
            fontSize: theme.fontSizeSM,
          }}
        >
          {t('supervisor.todoList.allComplete')}
        </span>
      </Flexbox>
    ) : (
      <Flexbox gap={0}>
        {todos.map((todo, index) => (
          <Flexbox
            align="center"
            gap={8}
            horizontal
            key={index}
            style={{
              borderBottom:
                index < todos.length - 1 ? `1px solid ${theme.colorBorderSecondary}` : 'none',
              padding: '8px 0',
              width: '100%',
            }}
          >
            <Center
              style={{
                color: todo.finished ? theme.colorSuccess : theme.colorTextTertiary,
                flexShrink: 0,
              }}
            >
              {todo.finished ? <CheckCircle size={16} /> : <Circle size={16} />}
            </Center>
            <span
              style={{
                color: todo.finished ? theme.colorTextTertiary : theme.colorText,
                fontSize: theme.fontSize,
                textDecoration: todo.finished ? 'line-through' : 'none',
              }}
            >
              {todo.content}
            </span>
          </Flexbox>
        ))}
      </Flexbox>
    );

  return (
    <Collapse
      defaultActiveKey={['todos']}
      expandIconPosition="end"
      items={[
        {
          children: todoItems,
          key: 'todos',
          label: headerContent,
        },
      ]}
      padding={{ body: 0 }}
      size="small"
      styles={{
        header: {
          fontSize: theme.fontSize,
          padding: '0px',
        },
      }}
      variant="borderless"
    />
  );
});

TodoList.displayName = 'TodoList';

export default TodoList;
