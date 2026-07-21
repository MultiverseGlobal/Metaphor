// Metaphor - The Context Operating System Engine - page.tsx
'use client';

import React from 'react';
import { MetaphorProvider, useMetaphor } from '../context/MetaphorContext';
import { AppLayout } from '../components/layout/AppLayout';
import { ContextStreamView } from '../components/context/ContextStreamView';
import { TimelineView } from '../components/timeline/TimelineView';
import { KnowledgeView } from '../components/knowledge/KnowledgeView';
import { ExploreView } from '../components/explore/ExploreView';
import { ConnectorsView } from '../components/connectors/ConnectorsView';

const MainViewDispatcher: React.FC = () => {
  const { activeView } = useMetaphor();

  switch (activeView) {
    case 'context':
      return <ContextStreamView />;
    case 'timeline':
      return <TimelineView />;
    case 'knowledge':
      return <KnowledgeView />;
    case 'explore':
      return <ExploreView />;
    case 'connectors':
      return <ConnectorsView />;
    default:
      return <ContextStreamView />;
  }
};

export default function MetaphorApp() {
  return (
    <MetaphorProvider>
      <AppLayout>
        <MainViewDispatcher />
      </AppLayout>
    </MetaphorProvider>
  );
}
